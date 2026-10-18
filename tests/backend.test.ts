import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/index';

const base=process.env.TEST_BASE_URL||'https://learning.test';
const origin=new URL(base).origin;
async function call(path:string,method='GET',data?:unknown,headers:Record<string,string>={}){
 const request=new Request(`${origin}${path}`,{method,headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...headers},body:data===undefined?undefined:JSON.stringify(data)});
 // No DB or account state is provided: public tools must work without either.
 return process.env.TEST_BASE_URL?fetch(request):worker.fetch(request,{} as Parameters<typeof worker.fetch>[1]);
}
const rpc=(id:number,method:string,params:unknown={},headers:Record<string,string>={})=>call('/mcp','POST',{jsonrpc:'2.0',id,method,params},{Accept:'application/json, text/event-stream',...headers});

test('anonymous MCP initialization, discovery, English teaching content and all five tools',async()=>{
 let r=await rpc(1,'initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'public-integration-test',version:'1'}});
 assert.equal(r.status,200,await r.clone().text());assert.ok((await r.json() as any).result.serverInfo);assert.equal(r.headers.get('www-authenticate'),null);assert.equal(r.headers.get('set-cookie'),null);
 r=await rpc(2,'tools/list');assert.equal(r.status,200);const list=await r.json() as any;assert.equal(list.result.tools.length,5);assert.ok(list.result.tools.every((tool:any)=>tool.annotations.readOnlyHint));
 r=await rpc(3,'tools/call',{name:'search_topics',arguments:{query:'telling the time',limit:30}});assert.equal(r.status,200);
 const result=await r.json() as any;assert.equal(result.result.isError,undefined);const tool=JSON.parse(result.result.content[0].text);assert.ok(tool.data.length>0);assert.ok(tool.sources[0].url);assert.equal(tool.attribution.databaseLicense,'ODbL-1.0');
 const id=tool.data[0].id;
 for(const [index,[name,args]] of [['get_topic',{id}],['get_prerequisites',{id}],['create_learning_path',{id,knownIds:[]}],['suggest_next_topics',{knownIds:[],subject:'Mathematics'}]].entries()){
  const response=await rpc(index+4,'tools/call',{name,arguments:args});assert.equal(response.status,200);const data=await response.json() as any;assert.ok(!data.result.isError,JSON.stringify(data));assert.ok(JSON.parse(data.result.content[0].text).data);
 }
});

test('public MCP supports cross-origin requests and preflight without credentials',async()=>{
 const r=await call('/mcp','OPTIONS',undefined,{Origin:'https://parent-tool.example','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,mcp-protocol-version'});
 assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-origin'),'*');assert.match(r.headers.get('access-control-allow-headers')!,/MCP-Protocol-Version/i);assert.equal(r.headers.get('access-control-allow-credentials'),null);
 const response=await rpc(1,'tools/list',{}, {Origin:'https://parent-tool.example'});assert.equal(response.status,200);assert.equal(response.headers.get('access-control-allow-origin'),'*');assert.equal(response.headers.get('www-authenticate'),null);
 for(const method of ['GET','DELETE','PUT'])assert.equal((await call('/mcp',method)).status,405);
});

test('public protocol keeps request and input bounds',async()=>{
 let r=await rpc(1,'tools/call',{name:'search_topics',arguments:{query:'a'.repeat(201)}});assert.equal(r.status,200);assert.equal((await r.json() as any).result.isError,true);
 r=await rpc(2,'tools/call',{name:'create_learning_path',arguments:{id:'time',knownIds:Array(201).fill('topic')}});assert.equal(r.status,200);assert.equal((await r.json() as any).result.isError,true);
 r=await rpc(3,'tools/call',{name:'search_topics',arguments:{query:'a'.repeat(17000)}});assert.equal(r.status,413);
 r=await call('/mcp','POST',{});assert.notEqual(r.status,401);assert.ok(r.status>=400);
});

test('retired account, token and OAuth endpoints expose no auth flow',async()=>{
 for(const [path,method] of [['/api/auth/register','POST'],['/api/auth/login','POST'],['/api/auth/me','GET'],['/api/token','POST'],['/api/account','DELETE'],['/oauth/register','POST'],['/oauth/authorize','GET'],['/oauth/token','POST'],['/oauth/revoke','POST'],['/.well-known/oauth-authorization-server','GET'],['/.well-known/oauth-protected-resource/mcp','GET']]){
  const r=await call(path,method);assert.equal(r.status,404,path);assert.equal(r.headers.get('www-authenticate'),null);assert.equal(r.headers.get('set-cookie'),null);
 }
 const r=await call('/api/topics?q=telling%20the%20time');assert.equal(r.status,200);assert.ok((await r.json() as any).topics.length>0);
});
