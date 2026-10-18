import {build} from 'esbuild';
import {writeFile,cp,mkdir} from 'node:fs/promises';
await build({entryPoints:['server/index.ts'],bundle:true,outfile:'dist/_worker.js',format:'esm',platform:'browser',target:'es2022',minify:true,external:['node:*']});
await writeFile('dist/_routes.json',JSON.stringify({version:1,include:['/api/*','/mcp','/oauth/*','/.well-known/*'],exclude:[]}));
await mkdir('dist/open-data',{recursive:true});
for(const file of ['topics.json','dependencies.json','nz-overlay.json'])await cp('data/'+file,'dist/open-data/'+file);
await cp('data/nz-maths','dist/open-data/nz-maths',{recursive:true});
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; connect-src \'self\'; frame-ancestors \'none\'; base-uri \'self\'; form-action \'self\'\n');
