import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';

const base=process.env.TEST_BASE_URL;
test('parent account, CSRF, MCP lifecycle and OAuth PKCE', {skip:!base}, async()=>{
 const origin=new URL(base!).origin;let session='';
 async function call(path:string,method='GET',data?:unknown,extra:Record<string,string>={}){
  return fetch(`${origin}${path}`,{method,headers:{...(session?{Cookie:session}:{}),...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...extra},body:data===undefined?undefined:JSON.stringify(data),redirect:'manual'});
 }
 const username=`test_${randomBytes(8).toString('hex')}`,password=randomBytes(24).toString('hex');
 let r=await call('/api/auth/register','POST',{username,password},{Origin:'https://malicious.invalid'});assert.equal(r.status,403);
 r=await call('/api/auth/register','POST',{username,password});assert.equal(r.status,200,await r.clone().text());session=r.headers.get('set-cookie')!.split(';')[0];assert.match(r.headers.get('set-cookie')!,/HttpOnly/);
 try {
  r=await call('/api/auth/me');assert.equal((await r.json() as any).user.username,username);
  r=await call('/api/auth/logout','POST');assert.equal(r.status,200);assert.equal((await (await call('/api/auth/me')).json() as any).user,null);
  r=await call('/api/auth/login','POST',{username,password:'incorrect-but-long'});assert.equal(r.status,401);
  r=await call('/api/auth/login','POST',{username,password});assert.equal(r.status,200);session=r.headers.get('set-cookie')!.split(';')[0];
  r=await call('/mcp','POST',{});assert.equal(r.status,401);assert.match(r.headers.get('www-authenticate')!,/resource_metadata/);
  r=await call('/api/token','POST',{});const first=await r.json() as any;assert.ok(first.token);assert.equal(first.mcpUrl,`${origin}/mcp`);
  const rpc=async(token:string,id:number,method:string,params:unknown={})=>call('/mcp','POST',{jsonrpc:'2.0',id,method,params},{Authorization:`Bearer ${token}`,Accept:'application/json, text/event-stream'});
  r=await rpc(first.token,1,'initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'integration-test',version:'1'}});assert.equal(r.status,200,await r.clone().text());assert.ok((await r.json() as any).result.serverInfo);
  r=await rpc(first.token,2,'tools/list');assert.equal(r.status,200);const list=await r.json() as any;assert.equal(list.result.tools.length,5);
  r=await rpc(first.token,3,'tools/call',{name:'search_topics',arguments:{query:'',limit:2}});assert.equal(r.status,200);const tool=JSON.parse((await r.json() as any).result.content[0].text);assert.equal(tool.data.length,2);assert.ok(tool.sources[0].url);assert.match(tool.guidance,/draft/i);assert.equal(tool.attribution.databaseLicense,'ODbL-1.0');
  r=await call('/api/token','POST',{});const second=await r.json() as any;assert.notEqual(first.token,second.token);assert.equal((await rpc(first.token,4,'tools/list')).status,401);
  r=await call('/oauth/register','POST',{client_name:'Test client',redirect_uris:['https://client.example/callback'],token_endpoint_auth_method:'none'});assert.equal(r.status,201);const client=await r.json() as any;
  r=await call('/oauth/register','POST',{redirect_uris:['javascript:alert(1)']});assert.equal(r.status,400);
  r=await call('/oauth/register','POST',{redirect_uris:['https://client.example/callback#fragment']});assert.equal(r.status,400);
  const verifier=randomBytes(32).toString('base64url'),challenge=createHash('sha256').update(verifier).digest('base64url');
  const params=new URLSearchParams({client_id:client.client_id,redirect_uri:'https://client.example/callback',response_type:'code',code_challenge_method:'S256',code_challenge:challenge,state:'test-state',resource:`${origin}/mcp`});
  const unsafe=new URLSearchParams(params);unsafe.set('redirect_uri','https://malicious.example/callback');assert.equal((await call(`/oauth/authorize?${unsafe}`)).status,400);
  r=await call(`/oauth/authorize?${params}`);assert.equal(r.status,200);const html=await r.text();const nonce=html.match(/name="nonce" value="([^"]+)"/)![1];
  r=await fetch(`${origin}/oauth/authorize`,{method:'POST',headers:{Origin:'https://malicious.example',Cookie:session,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({nonce,decision:'allow'}),redirect:'manual'});assert.equal(r.status,403);
  r=await fetch(`${origin}/oauth/authorize`,{method:'POST',headers:{Origin:origin,Cookie:session,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({nonce,decision:'allow'}),redirect:'manual'});assert.equal(r.status,303,await r.clone().text());
  const redirect=new URL(r.headers.get('location')!);assert.equal(redirect.searchParams.get('state'),'test-state');assert.equal(redirect.searchParams.get('iss'),origin);const code=redirect.searchParams.get('code')!;
  const tokenParams=new URLSearchParams({grant_type:'authorization_code',client_id:client.client_id,redirect_uri:'https://client.example/callback',code,code_verifier:verifier,resource:`${origin}/mcp`});
  const exchange=(p:URLSearchParams)=>fetch(`${origin}/oauth/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:p});
  const wrong=new URLSearchParams(tokenParams);wrong.set('code_verifier',randomBytes(32).toString('base64url'));assert.equal((await exchange(wrong)).status,400);
  r=await exchange(tokenParams);assert.equal(r.status,200,await r.clone().text());const access=(await r.json() as any).access_token;assert.equal((await exchange(tokenParams)).status,400,'code must be one use');
  assert.equal((await rpc(access,5,'tools/list')).status,200);
  r=await call(`/oauth/authorize?${params}`);const denyNonce=(await r.text()).match(/name="nonce" value="([^"]+)"/)![1];
  r=await fetch(`${origin}/oauth/authorize`,{method:'POST',headers:{Origin:origin,Cookie:session,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({nonce:denyNonce,decision:'deny'}),redirect:'manual'});assert.equal(r.status,303);const denied=new URL(r.headers.get('location')!);assert.equal(denied.searchParams.get('error'),'access_denied');assert.equal(denied.searchParams.get('iss'),origin);assert.equal(denied.searchParams.has('code'),false);
  const firstSession=session,otherUsername=`test_${randomBytes(8).toString('hex')}`;
  r=await call('/api/auth/register','POST',{username:otherUsername,password});assert.equal(r.status,200);session=r.headers.get('set-cookie')!.split(';')[0];
  try{
   assert.equal((await (await call('/api/auth/me')).json() as any).token,null);
   assert.equal((await call('/api/token','DELETE')).status,200);
   assert.equal((await rpc(second.token,8,'tools/list')).status,200,'another account cannot revoke first account tokens');
  }finally{assert.equal((await call('/api/account','DELETE',{password})).status,200);session=firstSession;}
  // The per-account MCP budget eventually rejects excess calls without invalidating the account.
  let limited=false;for(let i=0;i<121;i++){const response=await rpc(second.token,100+i,'tools/list');if(response.status===429){limited=true;break;}assert.equal(response.status,200);}assert.equal(limited,true);
  r=await call('/api/token','DELETE');assert.equal(r.status,200);assert.equal((await rpc(access,6,'tools/list')).status,401);assert.equal((await rpc(second.token,7,'tools/list')).status,401);
  r=await call('/api/account','DELETE',{password:'incorrect'});assert.equal(r.status,401);
 } finally {
  r=await call('/api/account','DELETE',{password});assert.equal(r.status,200,await r.clone().text());r=await call('/api/auth/me');assert.equal((await r.json() as any).user,null);
 }
});
