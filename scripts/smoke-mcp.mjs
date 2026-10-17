import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base=process.env.TEST_BASE_URL||'http://localhost:8788';
const username='sdk_'+randomBytes(8).toString('hex'),password=randomBytes(24).toString('hex');
const registration=await fetch(base+'/api/auth/register',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({username,password})});
assert.equal(registration.status,200,await registration.clone().text());
const Cookie=registration.headers.get('set-cookie').split(';')[0];
const headers={Origin:base,Cookie,'Content-Type':'application/json'};
let client;
try{
 const response=await fetch(base+'/api/token',{method:'POST',headers,body:'{}'});const {token}=await response.json();assert.ok(token);
 client=new Client({name:'learning-paths-acceptance',version:'1.0.0'});
 await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp'),{requestInit:{headers:{Authorization:`Bearer ${token}`}}}));
 const tools=await client.listTools();assert.equal(tools.tools.length,5);
 const search=await client.callTool({name:'search_topics',arguments:{query:'coins'}});
 const data=JSON.parse(search.content[0].text);const topic=data.data.find(t=>t.nz);assert.ok(topic);
 for(const [name,args] of [['get_topic',{id:topic.id}],['get_prerequisites',{id:topic.id}],['create_learning_path',{id:topic.id,knownIds:[]}],['suggest_next_topics',{knownIds:[],subject:'Mathematics'}]]){
  const result=await client.callTool({name,arguments:args});assert.ok(!result.isError,JSON.stringify(result));assert.ok(JSON.parse(result.content[0].text).data);
 }
 console.log('PASS: official MCP SDK initializes, discovers and calls all five tools on '+base);
}finally{
 await client?.close();const deleted=await fetch(base+'/api/account',{method:'DELETE',headers,body:JSON.stringify({password})});assert.equal(deleted.status,200);console.log('Temporary SDK account deleted.');
}
