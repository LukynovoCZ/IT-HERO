import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {connect} from '../scripts/connect_community.mjs';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'it-hero-connect-'));
try{
 await fs.mkdir(path.join(root,'cloud-api'));for(const file of ['dialogue-admin.html','dialogue-suggestions.html'])await fs.copyFile(file,path.join(root,file));
 await assert.rejects(()=>connect({root,url:'https://evil.invalid/'}),/ověřená/);
 await connect({root,url:'https://it-hero-community.test-account.workers.dev',sourceCommit:'test'});
 const config=await fs.readFile(path.join(root,'community-config.js'),'utf8');assert(config.includes('https://it-hero-community.test-account.workers.dev'));assert(!config.includes('TOKEN'));
 for(const file of ['dialogue-admin.html','dialogue-suggestions.html'])assert((await fs.readFile(path.join(root,file),'utf8')).includes('community-config.js?v=cloud-'));
 assert.equal(JSON.parse(await fs.readFile(path.join(root,'cloud-api/deployment.json'),'utf8')).sourceCommit,'test');
 console.log('PASS API connection: accepted public endpoint, rejected foreign URL, cache refresh on both forms and public readiness record.');
}finally{await fs.rm(root,{recursive:true,force:true});}
