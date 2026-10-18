type RuntimeEnv = EventContext<Env,string,unknown>['env'];
import {mcp} from './mcp';
import {getTopic,searchTopics} from '../lib/graph';
const json=(data:unknown,status=200)=>Response.json(data,{status});
async function route(request:Request,env:RuntimeEnv):Promise<Response>{
 const url=new URL(request.url),path=url.pathname;
 if(path==='/mcp')return mcp(request);
 if(path.startsWith('/oauth/')||path.startsWith('/.well-known/oauth-'))return json({error:'Not found'},404);
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(path==='/api/health'&&request.method==='GET')return json({ok:true});
 if(path==='/api/topics'&&request.method==='GET')return json({topics:searchTopics((url.searchParams.get('q')||'').slice(0,200),(url.searchParams.get('subject')||'').slice(0,50)||undefined,Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||100)))});
 if(path.startsWith('/api/topics/')&&request.method==='GET'){const topic=getTopic(decodeURIComponent(path.slice(12)));return topic?json({topic}):json({error:'Topic not found'},404);}
 return json({error:'Not found'},404);
}
export default {
 async fetch(request:Request,env:RuntimeEnv):Promise<Response>{
  let response:Response;try{response=await route(request,env);}catch(error){response=json({error:'The service could not complete this request.'},500);console.error('request_failed',{path:new URL(request.url).pathname,error:error instanceof Error?error.message:'unknown'});}
  const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
} satisfies ExportedHandler<RuntimeEnv>;
