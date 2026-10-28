import {curriculumContext as mathsCurriculumContext} from '../lib/maths';
import {nzCurriculumContext} from '../lib/nz-curriculum';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {z} from 'zod';
import {searchTopics,getTopic,prerequisites,learningPath,frontier,sources,guidance,dependents} from '../lib/graph';
const annotations={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};
export function createMcpServer():McpServer{
 const server=new McpServer({name:'nz-learning-graph',version:'1.0.0'},{instructions:'Help a learner explore independently or a parent guide a child with questions, hints and small practice activities. Use the topic dependencies to build a learning sequence and adapt the difficulty from the learner’s answers. Never ask for child names, school, address or private records. Use the linked sources for curriculum context. Keep teaching terms and learning activities in English unless the parent requests another language.'});
 const referencedSources=(value:unknown)=>{const ids=new Set<string>();function walk(v:unknown){if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if((k==='source_ids'||k==='sourceIds')&&Array.isArray(x))for(const id of x)ids.add(String(id));else walk(x);}}walk(value);return sources.filter(s=>ids.has(s.id));};
 const result=(value:unknown)=>({content:[{type:'text' as const,text:JSON.stringify({data:value??{error:'Topic not found'},guidance,sources:referencedSources(value),attribution:{original:'Marble Skill Taxonomy (v1) © Generative Spark, Inc. (Marble)',source:'https://withmarble.com',databaseLicense:'ODbL-1.0',contentLicense:'Marble-authored content: CC-BY-SA-4.0; NZ curriculum-derived content: CC-BY-NC-4.0, subject to source exceptions.',adaptation:'NZ Learning Graph activities and curriculum connections.',curriculumAdaptations:'NZ Ministry of Education material on Tāhūrangi is generally CC BY-NC 4.0, subject to its copyright exceptions; see source records and PROVENANCE.md.'}})}]});
 server.registerTool('search_topics',{description:'Find learning topics and NZ curriculum connections.',inputSchema:{query:z.string().max(200),subject:z.string().max(50).optional(),limit:z.number().int().min(1).max(30).optional()},annotations},async({query,subject,limit})=>result(searchTopics(query,subject,limit)));
 server.registerTool('get_topic',{description:'Read a topic, parent explanation, teaching prompts and official source links.',inputSchema:{id:z.string().max(100)},annotations},async({id})=>result(getTopic(id)?{...getTopic(id),nextTopics:dependents(id)}:undefined));
 server.registerTool('get_curriculum_context',{description:'Read scoped curriculum mappings, independent framework and standard records, and known coverage gaps. School years are distinct from qualification levels.',inputSchema:{id:z.string().max(100)},annotations},async({id})=>result(getTopic(id)?nzCurriculumContext(id)||mathsCurriculumContext(id):undefined));
 server.registerTool('get_prerequisites',{description:'Read prerequisite topics and dependency evidence.',inputSchema:{id:z.string().max(100)},annotations},async({id})=>result(prerequisites(id)));
 server.registerTool('create_learning_path',{description:'Plan a prerequisite-first learning sequence. Known topics are supplied for this request only and are not saved.',inputSchema:{id:z.string().max(100),knownIds:z.array(z.string().max(100)).max(200).default([])},annotations},async({id,knownIds})=>result(learningPath(id,knownIds)));
 server.registerTool('suggest_next_topics',{description:'Suggest topics with satisfied prerequisites. Known topics are supplied for this request only and are not saved.',inputSchema:{knownIds:z.array(z.string().max(100)).max(200).default([]),subject:z.string().max(50).optional()},annotations},async({knownIds,subject})=>result(frontier(knownIds,subject)));
 return server;
}
export async function mcp(request:Request):Promise<Response>{
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID','Access-Control-Expose-Headers':'MCP-Protocol-Version, MCP-Session-Id','Access-Control-Max-Age':'86400'};
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(request.method!=='POST')return new Response(null,{status:405,headers:{...cors,Allow:'POST, OPTIONS'}});
 const server=createMcpServer(),transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true,maxRequestBodySize:16384});
 await server.connect(transport);
 try{
  const response=await transport.handleRequest(request),headers=new Headers(response.headers);
  for(const [name,value] of Object.entries(cors))headers.set(name,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }finally{await server.close();}
}
