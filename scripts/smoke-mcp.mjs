import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base=process.env.TEST_BASE_URL||'http://localhost:8788';
const client=new Client({name:'learning-paths-acceptance',version:'1.0.0'});
try{
 await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp')));
 const tools=await client.listTools();assert.equal(tools.tools.length,5);
 const search=await client.callTool({name:'search_topics',arguments:{query:'coins'}});
 const data=JSON.parse(search.content[0].text);const topic=data.data.find(t=>t.nz);assert.ok(topic);
 for(const [name,args] of [['get_topic',{id:topic.id}],['get_prerequisites',{id:topic.id}],['create_learning_path',{id:topic.id,knownIds:[]}],['suggest_next_topics',{knownIds:[],subject:'Mathematics'}]]){
  const result=await client.callTool({name,arguments:args});assert.ok(!result.isError,JSON.stringify(result));assert.ok(JSON.parse(result.content[0].text).data);
 }
 console.log('PASS: anonymous official MCP SDK initializes, discovers and calls all five tools on '+base);
}finally{await client.close();}
