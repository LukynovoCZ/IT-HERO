import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHmac,publicEncrypt,constants,randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {buildPublicCopy} from './build_public_copy.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),run=promisify(execFile);

export async function deployPublicCopy(){
 const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID,admin=process.env.IT_HERO_ADMIN_TOKEN;
 if(!token||!account||!admin||admin.length<32)throw Error('Cloudflare credentials or moderation password are not configured.');
 const project='office-arcade-'+createHmac('sha256',admin).update('neutral-copy/v1').digest('hex').slice(0,14);
 const url=`https://${project}.pages.dev`;
 console.log(`::add-mask::${project}`);console.log(`::add-mask::${url}`);
 async function api(route,method='GET',body){
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${route}`,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data?.success){const codes=(data?.errors||[]).map(x=>Number(x.code)).filter(Number.isFinite).join(',');throw Error(`Cloudflare ${route.startsWith('/pages/')?'Pages':'D1'} ${method}: HTTP ${response.status}, codes ${codes||'none'}. The API token needs Account / Cloudflare Pages / Edit and Account / D1 / Read for the selected account.`);}
  return data.result;
 }
 // Check permissions before changing resources. Never change the existing web or Worker.
 let existing;for(let page=1;page<=100;page++){
  const projects=await api(`/pages/projects?per_page=100&page=${page}`);existing=projects.find(p=>p.name===project);if(existing||projects.length<100)break;
 }
 let database;for(let page=1;page<=100;page++){
  const databases=await api(`/d1/database?per_page=100&page=${page}`);database=databases.find(d=>d.name==='it-hero-community');if(database||databases.length<100)break;
 }
 if(!database?.uuid)throw Error('Existing community database not found. No replacement database was created.');
 const deployment={compatibility_date:'2026-10-01',d1_databases:{DB:{id:database.uuid}},env_vars:{ADMIN_TOKEN:{type:'secret_text',value:admin}}};
 const settings={deployment_configs:{production:deployment,preview:deployment}};
 await api(existing?`/pages/projects/${project}`:'/pages/projects',existing?'PATCH':'POST',existing?settings:{name:project,production_branch:'release',...settings});
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'arcade-release-'));
 try{
  await buildPublicCopy(directory);
  try{
   await run('npx',['--yes','wrangler@4','pages','deploy',directory,'--project-name',project,'--branch','release','--commit-dirty=true','--commit-hash',randomBytes(20).toString('hex'),'--commit-message','Public release'],{cwd:directory,env:{...process.env,CI:'true',WRANGLER_SEND_METRICS:'false'},timeout:600000,maxBuffer:8*1024*1024});
  }catch{throw Error('Pages upload failed. Output was withheld to avoid publishing the neutral URL or private configuration. Check token permissions for Cloudflare Pages / Edit.');}
  // Do not expose the neutral address in public logs or source history.
  let ready=false;
  for(let attempt=0;attempt<12;attempt++){
   try{
    const [home,config,scores,stats,moderation,preflight]=await Promise.all([
     fetch(url),fetch(url+'/community-config.js'),fetch(url+'/v1/scores'),fetch(url+'/v1/play-stats'),
     fetch(url+'/v1/admin/dialogue-suggestions',{headers:{Authorization:`Bearer ${admin}`}}),
     fetch(url+'/v1/dialogue-suggestions',{method:'OPTIONS',headers:{Origin:url}})
    ]);
    const html=await home.text(),configuration=await config.text(),scoreData=await scores.json(),statData=await stats.json(),adminData=await moderation.json();
    ready=home.ok&&html.includes('IT HERO')&&!/lukynovo|l-baborak|github\.io/i.test(html+configuration)&&configuration.includes('location.origin')&&scores.ok&&Array.isArray(scoreData.items)&&stats.ok&&Number.isSafeInteger(statData.total)&&moderation.ok&&Array.isArray(adminData.items)&&preflight.status===204&&preflight.headers.get('Access-Control-Allow-Origin')===url;
    if(ready)break;
   }catch{}
   await new Promise(resolve=>setTimeout(resolve,3000));
  }
  if(!ready)throw Error('Upload finished, but live checks did not pass. The original game has not been changed.');
  const key=await fs.readFile(path.join(root,'cloud-api/public-copy-receipt.pem'));
  const receipt=publicEncrypt({key,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(JSON.stringify({url,verified:true})));
  await fs.writeFile(path.join(root,'cloud-api/public-copy-receipt.json'),JSON.stringify({version:1,ciphertext:receipt.toString('base64')},null,2)+'\n');
  if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`verified=true\n`);
  // This file is runner-local and is never committed or uploaded as a public artifact.
  if(process.env.PUBLIC_COPY_LIVE_URL_FILE)await fs.writeFile(process.env.PUBLIC_COPY_LIVE_URL_FILE,url,{mode:0o600});
  console.log('Neutral copy deployed; same-origin API, shared data and moderation verified. Address stored in encrypted receipt only.');
 }finally{await fs.rm(directory,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url))deployPublicCopy().catch(e=>{console.error(e.message);process.exitCode=1;});
