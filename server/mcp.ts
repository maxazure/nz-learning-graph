import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {z} from 'zod';
import {searchTopics,getTopic,prerequisites,learningPath,frontier,sources,guidance} from '../lib/graph';
import {hash,json,now,rateLimit} from './security';
const annotations={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};
export function createMcpServer():McpServer{
 const server=new McpServer({name:'nz-learning-graph',version:'1.0.0'},{instructions:'Help a parent guide a child with questions, hints and small practice activities. Do not diagnose a child, assign grades, or claim draft mappings are official NZ curriculum approval. Never ask for child names, school, address or private records. The graph is a starting point; consult the linked official curriculum sources. A caregiver supervises every session.'});
 const result=(value:unknown)=>({content:[{type:'text' as const,text:JSON.stringify({data:value??{error:'Topic not found'},guidance,sources,attribution:{original:'Marble Skill Taxonomy (v1) © Generative Spark, Inc. (Marble)',source:'https://withmarble.com',databaseLicense:'ODbL-1.0',contentLicense:'CC-BY-SA-4.0',adaptation:'NZ Learning Graph editorial activities and draft mappings; original ages are not NZ year requirements.'}})}]});
 server.registerTool('search_topics',{description:'Find learning topics and draft NZ curriculum mappings.',inputSchema:{query:z.string().max(200),subject:z.string().max(50).optional(),limit:z.number().int().min(1).max(30).optional()},annotations},async({query,subject,limit})=>result(searchTopics(query,subject,limit)));
 server.registerTool('get_topic',{description:'Read a topic, parent explanation, teaching prompts and official source links.',inputSchema:{id:z.string().max(100)},annotations},async({id})=>result(getTopic(id)));
 server.registerTool('get_prerequisites',{description:'Read prerequisite topics and dependency evidence.',inputSchema:{id:z.string().max(100)},annotations},async({id})=>result(prerequisites(id)));
 server.registerTool('create_learning_path',{description:'Plan a prerequisite-first learning sequence. Known topics are supplied for this request only and are not saved.',inputSchema:{id:z.string().max(100),knownIds:z.array(z.string().max(100)).max(200).default([])},annotations},async({id,knownIds})=>result(learningPath(id,knownIds)));
 server.registerTool('suggest_next_topics',{description:'Suggest topics with satisfied prerequisites. Known topics are supplied for this request only and are not saved.',inputSchema:{knownIds:z.array(z.string().max(100)).max(200).default([]),subject:z.string().max(50).optional()},annotations},async({knownIds,subject})=>result(frontier(knownIds,subject)));
 return server;
}
export async function mcp(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url),origin=request.headers.get('Origin');
 // Remote server clients omit Origin; same-site web clients are supported.
 if(origin&&origin!==url.origin)return json({error:'Origin is not allowed.'},403);
 const bearer=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
 const token=bearer?await env.DB.prepare('SELECT user_id FROM tokens WHERE hash=? AND expires_at>?').bind(await hash(bearer),now()).first<{user_id:string}>():null;
 if(!token)return json({error:'A valid MCP access token is required.'},401,{'WWW-Authenticate':`Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource/mcp", scope="graph:read"`});
 await rateLimit(env.DB,request,`mcp:${token.user_id}`,120,60);
 if(request.method==='GET'||request.method==='DELETE')return new Response(null,{status:405,headers:{Allow:'POST'}});
 const server=createMcpServer(),transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true,maxRequestBodySize:16384});
 await server.connect(transport);
 try{return await transport.handleRequest(request);}finally{await server.close();}
}
