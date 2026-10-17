type RuntimeEnv = EventContext<Env,string,unknown>['env'];
import {oauth} from './oauth';
import {mcp} from './mcp';
import {cookie,equal,fail,hash,json,jsonBody,now,passwordHash,randomToken,rateLimit,requireUser,sameOrigin,sessionUser} from './security';
import {getTopic,searchTopics} from '../lib/graph';
export async function cleanup(db:D1Database):Promise<void>{await db.batch(['sessions','tokens','oauth_pending','oauth_codes','rate_limits'].map(table=>db.prepare(`DELETE FROM ${table} WHERE expires_at<=?`).bind(now())));}
async function dailyCleanup(db:D1Database):Promise<void>{
 const day=Math.floor(now()/86400);
 const lock=await db.prepare('INSERT OR IGNORE INTO rate_limits(key,count,expires_at) VALUES (?,1,?)').bind(`cleanup:${day}`,(day+1)*86400).run();
 if(lock.meta.changes)await cleanup(db);
}
async function route(request:Request,env:RuntimeEnv):Promise<Response>{
 const url=new URL(request.url),path=url.pathname;
 if(path==='/mcp')return mcp(request,env);
 const authResponse=await oauth(request,env);if(authResponse)return authResponse;
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(path==='/api/health')return json({ok:true});
 if(path==='/api/topics'&&request.method==='GET')return json({topics:searchTopics(url.searchParams.get('q')||'',url.searchParams.get('subject')||undefined,Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||100)))});
 if(path.startsWith('/api/topics/')&&request.method==='GET'){const topic=getTopic(decodeURIComponent(path.slice(12)));return topic?json({topic}):json({error:'Topic not found'},404);}
 if(path==='/api/auth/me'&&request.method==='GET'){
  const user=await sessionUser(request,env.DB);const token=user?await env.DB.prepare("SELECT created_at,expires_at FROM tokens WHERE user_id=? AND kind='personal' AND expires_at>? LIMIT 1").bind(user.id,now()).first():null;
  return json({user:user?{id:user.id,username:user.username}:null,token});
 }
 if(!['POST','DELETE'].includes(request.method))return json({error:'Not found'},404);
 sameOrigin(request);
 if(path==='/api/auth/register'||path==='/api/auth/login'){
  if(request.method!=='POST')fail('Method not allowed.',405);
  await rateLimit(env.DB,request,'auth',20);const input=await jsonBody(request);
  const username=typeof input.username==='string'?input.username.toLowerCase().trim():'';const password=typeof input.password==='string'?input.password:'';
  if(!/^[a-z0-9_-]{3,40}$/.test(username)||password.length<12||password.length>128)fail('Use a username of 3–40 letters, digits, underscores or hyphens and a password of 12–128 characters.');
  let user=await env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first<{id:string;password_hash:string;salt:string}>();
  if(path.endsWith('/register')){
   if(user)fail('This username is unavailable.',409);
   const id=crypto.randomUUID(),salt=randomToken(),digest=await passwordHash(password,salt);
   const inserted=await env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?,?,?,?,?)').bind(id,username,digest,salt,now()).run();if(!inserted.meta.changes)fail('This username is unavailable.',409);user={id,password_hash:digest,salt};
  }else{
   const digest=await passwordHash(password,user?.salt||'unregistered-user-timing-padding');
   if(!user||!equal(digest,user.password_hash))fail('Username or password is incorrect.',401);
  }
  const token=randomToken();await env.DB.prepare('INSERT INTO sessions VALUES (?,?,?)').bind(await hash(token),user.id,now()+604800).run();
  return json({user:{id:user.id,username}},200,{'Set-Cookie':cookie(request,token)});
 }
 const user=await requireUser(request,env.DB);
 if(path==='/api/auth/logout'&&request.method==='POST'){
  const current=request.headers.get('Cookie')?.match(/(?:^|;\s*)nz_session=([^;]+)/)?.[1]||'';await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await hash(current)).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});
 }
 if(path==='/api/token'){
  await rateLimit(env.DB,request,`token:${user.id}`,30);
  if(request.method==='DELETE'){await env.DB.prepare('DELETE FROM tokens WHERE user_id=?').bind(user.id).run();return json({ok:true});}
  const token=randomToken(),expiresAt=now()+7776000;
  await env.DB.batch([env.DB.prepare("DELETE FROM tokens WHERE user_id=? AND kind='personal'").bind(user.id),env.DB.prepare('INSERT INTO tokens VALUES (?,?,?,?,?)').bind(await hash(token),user.id,'personal',now(),expiresAt)]);
  return json({token,expiresAt,mcpUrl:`${url.origin}/mcp`});
 }
 if(path==='/api/account'&&request.method==='DELETE'){
  await rateLimit(env.DB,request,`delete:${user.id}`,5);const input=await jsonBody(request);if(typeof input.password!=='string'||input.password.length>128||!equal(await passwordHash(input.password,user.salt),user.password_hash))fail('Password is incorrect.',401);
  await env.DB.prepare('DELETE FROM users WHERE id=?').bind(user.id).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});
 }
 return json({error:'Not found'},404);
}
export default {
 async fetch(request:Request,env:RuntimeEnv,ctx:ExecutionContext):Promise<Response>{
  const path=new URL(request.url).pathname;
  if(request.method==='POST'&&(path==='/api/auth/register'||path==='/api/auth/login'))ctx.waitUntil(dailyCleanup(env.DB));
  let response:Response;try{response=await route(request,env);}catch(error){response=error instanceof Response?error:json({error:'The service could not complete this request.'},500);if(!(error instanceof Response))console.error('request_failed',{path:new URL(request.url).pathname,error:error instanceof Error?error.message:'unknown'});}
  const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
} satisfies ExportedHandler<RuntimeEnv>;
