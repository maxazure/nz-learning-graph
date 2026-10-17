import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomBytes} from 'node:crypto';
const exec=promisify(execFile);
// Local-only, opt-in test: CLI queries must stay asynchronous so HTTP sockets can expire normally.
test('D1 deletion cascades and request-triggered expiry cleanup',{skip:!process.env.TEST_LOCAL_STORAGE||!process.env.TEST_BASE_URL},async()=>{
 const origin=new URL(process.env.TEST_BASE_URL!).origin;
 assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname),'This test requires local D1.');
 async function sql(command:string){const {stdout}=await exec(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','nz-learning-graph','--local','--command',command,'--json']);return JSON.parse(stdout)[0].results;}
 const password=randomBytes(24).toString('hex');
 async function register(prefix:string){const response=await fetch(`${origin}/api/auth/register`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({username:prefix+randomBytes(5).toString('hex'),password})});assert.equal(response.status,200);const user=(await response.json() as {user:{id:string}}).user;assert.match(user.id,/^[a-f0-9-]+$/);return {id:user.id,headers:{Origin:origin,Cookie:response.headers.get('set-cookie')!.split(';')[0],'Content-Type':'application/json'}};}
 const account=await register('storage_');
 try{
  assert.equal((await fetch(`${origin}/api/token`,{method:'POST',headers:account.headers,body:'{}'})).status,200);
  for(const table of ['sessions','tokens'])assert.equal((await sql(`SELECT count(*) AS n FROM ${table} WHERE user_id='${account.id}'`))[0].n,1);
 }finally{assert.equal((await fetch(`${origin}/api/account`,{method:'DELETE',headers:account.headers,body:JSON.stringify({password})})).status,200);}
 for(const table of ['sessions','tokens','oauth_pending','oauth_codes'])assert.equal((await sql(`SELECT count(*) AS n FROM ${table} WHERE user_id='${account.id}'`))[0].n,0);
 const key=`expired_test_${randomBytes(5).toString('hex')}`;
 await sql(`INSERT INTO rate_limits VALUES ('${key}',1,1)`);await sql("DELETE FROM rate_limits WHERE key LIKE 'cleanup:%'");
 const cleanupAccount=await register('cleanup_');
 try{assert.equal((await sql(`SELECT count(*) AS n FROM rate_limits WHERE key='${key}'`))[0].n,0);}
 finally{assert.equal((await fetch(`${origin}/api/account`,{method:'DELETE',headers:cleanupAccount.headers,body:JSON.stringify({password})})).status,200);}
});
