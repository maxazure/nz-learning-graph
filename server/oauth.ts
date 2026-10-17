import {bodyText,escapeHtml,fail,hash,json,jsonBody,now,randomToken,rateLimit,requireUser,sameOrigin,sessionUser} from './security';
type Client={id:string;name:string;redirects:string};
type Pending={user_id:string;client_id:string;redirect_uri:string;challenge:string;state:string;resource:string;expires_at:number};
export async function oauth(request:Request,env:Env):Promise<Response|null>{
 const url=new URL(request.url),origin=url.origin,path=url.pathname;
 if(path.startsWith('/.well-known/oauth-protected-resource'))return json({resource:`${origin}/mcp`,authorization_servers:[origin],scopes_supported:['graph:read'],bearer_methods_supported:['header']});
 if(path==='/.well-known/oauth-authorization-server')return json({issuer:origin,authorization_response_iss_parameter_supported:true,authorization_endpoint:`${origin}/oauth/authorize`,token_endpoint:`${origin}/oauth/token`,registration_endpoint:`${origin}/oauth/register`,revocation_endpoint:`${origin}/oauth/revoke`,response_types_supported:['code'],grant_types_supported:['authorization_code'],code_challenge_methods_supported:['S256'],token_endpoint_auth_methods_supported:['none'],scopes_supported:['graph:read']});
 if(!path.startsWith('/oauth/'))return null;
 if(path==='/oauth/register' && request.method==='POST'){
  await rateLimit(env.DB,request,'oauth-register',30,3600);const input=await jsonBody(request);
  const redirects=input.redirect_uris;if(!Array.isArray(redirects)||redirects.length<1||redirects.length>10)fail('Supply 1–10 redirect URIs.');
  for(const value of redirects){if(typeof value!=='string'||value.length>2048)fail('Invalid redirect URI.');let target:URL;try{target=new URL(value);}catch{fail('Invalid redirect URI.');}if(target.hash||target.username||target.password||(target.protocol!=='https:'&&!(target.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(target.hostname))))fail('Use HTTPS or a loopback HTTP redirect URI.');}
  if(input.token_endpoint_auth_method&&input.token_endpoint_auth_method!=='none')fail('Only public clients using PKCE are supported.');
  const id=randomToken(),name=typeof input.client_name==='string'?input.client_name.slice(0,100):'AI learning tool';
  await env.DB.prepare('INSERT INTO oauth_clients VALUES (?,?,?,?)').bind(id,name,JSON.stringify(redirects),now()).run();
  return json({client_id:id,client_name:name,redirect_uris:redirects,token_endpoint_auth_method:'none',grant_types:['authorization_code'],response_types:['code']},201);
 }
 if(path==='/oauth/authorize'&&request.method==='GET'){
  const q=url.searchParams;const client=await env.DB.prepare('SELECT * FROM oauth_clients WHERE id=?').bind(q.get('client_id')||'').first<Client>();
  const redirect=q.get('redirect_uri')||'',challenge=q.get('code_challenge')||'';
  if(!client||!JSON.parse(client.redirects).includes(redirect))fail('Unregistered client or redirect URI.');
  if(q.get('response_type')!=='code'||q.get('code_challenge_method')!=='S256'||!/^[-_A-Za-z0-9]{43}$/.test(challenge))fail('Authorization code with PKCE S256 is required.');
  if(q.get('scope') && q.get('scope')!=='graph:read')fail('Unsupported scope.');
  if(q.get('resource')&&q.get('resource')!==`${origin}/mcp`)fail('Invalid resource.');
  if((q.get('state')||'').length>2048)fail('State is too long.');
  const user=await sessionUser(request,env.DB);if(!user)return Response.redirect(`${origin}/?login=1&returnTo=${encodeURIComponent(path+url.search)}`,302);
  await rateLimit(env.DB,request,'consent',60);const nonce=randomToken();
  await env.DB.prepare('INSERT INTO oauth_pending VALUES (?,?,?,?,?,?,?,?)').bind(await hash(nonce),user.id,client.id,redirect,challenge,q.get('state')||'',`${origin}/mcp`,now()+600).run();
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connect your learning tool · Learning Paths NZ</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#F5EFE3;color:#1B231E;font:17px/1.6 system-ui,sans-serif;padding:clamp(20px,6vw,80px) 20px}main{max-width:660px;margin:0 auto;background:#FBF8F1;border:1px solid #DCD2BE;border-radius:22px;padding:clamp(24px,5vw,48px)}.brand{color:#1E3B2B;font-size:14px;letter-spacing:.08em;text-transform:uppercase}h1{color:#1E3B2B;font:2.4rem/1.15 Palatino,Georgia,serif;margin:24px 0}code{overflow-wrap:anywhere;font-size:14px}form{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}button{border:1px solid #1E3B2B;border-radius:8px;padding:12px 20px;background:#1E3B2B;color:#fff;font:inherit;cursor:pointer;min-height:48px}button[value=deny]{background:transparent;color:#1E3B2B}button:focus-visible{outline:3px solid #D8662A;outline-offset:4px}.note{color:#47524B;font-size:14px;margin-top:28px}</style><body><main><div class="brand">Learning Paths NZ</div><h1>Connect ${escapeHtml(client.name)}?</h1><p>Signed in as ${escapeHtml(user.username)}. This app requests read-only access to the public NZ learning graph through your account. No child profiles or learning records are stored here.</p><p>Return address: <code>${escapeHtml(redirect)}</code></p><form method="post" action="/oauth/authorize"><input type="hidden" name="nonce" value="${nonce}"><button name="decision" value="allow">Allow connection</button> <button name="decision" value="deny">Cancel</button></form><p class="note">You can revoke all AI connections from your account at any time. This connection expires after 24 hours. Learning activities and NZ mappings are editorial drafts, awaiting teacher review.</p></main></body></html>`,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':`default-src 'none'; style-src 'nonce-${nonce}'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`}});
 }
 if(path==='/oauth/authorize'&&request.method==='POST'){
  sameOrigin(request);const user=await requireUser(request,env.DB);const form=new URLSearchParams(await bodyText(request));
  const pending=await env.DB.prepare('DELETE FROM oauth_pending WHERE hash=? AND user_id=? AND expires_at>? RETURNING *').bind(await hash(form.get('nonce')||''),user.id,now()).first<Pending>();if(!pending)fail('This consent request has expired. Start again.');
  const target=new URL(pending.redirect_uri);target.searchParams.set('iss',origin);if(pending.state)target.searchParams.set('state',pending.state);
  if(form.get('decision')!=='allow'){target.searchParams.set('error','access_denied');return Response.redirect(target.toString(),303);}
  const code=randomToken();await env.DB.prepare('INSERT INTO oauth_codes VALUES (?,?,?,?,?,?,?)').bind(await hash(code),user.id,pending.client_id,pending.redirect_uri,pending.challenge,pending.resource,now()+120).run();target.searchParams.set('code',code);return Response.redirect(target.toString(),303);
 }
 if(path==='/oauth/token'&&request.method==='POST'){
  await rateLimit(env.DB,request,'oauth-token',60);const p=new URLSearchParams(await bodyText(request));
  if(p.get('grant_type')!=='authorization_code')return json({error:'unsupported_grant_type'},400);
  const verifier=p.get('code_verifier')||'';if(!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))return json({error:'invalid_grant'},400);
  const code=await env.DB.prepare('DELETE FROM oauth_codes WHERE hash=? AND client_id=? AND redirect_uri=? AND challenge=? AND expires_at>? RETURNING *').bind(await hash(p.get('code')||''),p.get('client_id')||'',p.get('redirect_uri')||'',await hash(verifier),now()).first<Pending>();
  if(!code || (p.get('resource')&&p.get('resource')!==code.resource))return json({error:'invalid_grant'},400);
  const token=randomToken();await env.DB.prepare('INSERT INTO tokens VALUES (?,?,?,?,?)').bind(await hash(token),code.user_id,'oauth',now(),now()+86400).run();return json({access_token:token,token_type:'Bearer',expires_in:86400,scope:'graph:read'});
 }
 if(path==='/oauth/revoke'&&request.method==='POST'){const p=new URLSearchParams(await bodyText(request));await env.DB.prepare('DELETE FROM tokens WHERE hash=?').bind(await hash(p.get('token')||'')).run();return json({});}
 return json({error:'Not found'},404);
}
