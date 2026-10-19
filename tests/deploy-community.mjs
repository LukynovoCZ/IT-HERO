import assert from 'node:assert/strict';
import {deploy} from '../scripts/deploy_community.mjs';
const env={CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32),CLOUDFLARE_API_TOKEN:'test-cloudflare-token-not-real',IT_HERO_ADMIN_TOKEN:'test-admin-password-not-real-123456789'};
let calls=[],logs=[];
function response(result){return Response.json({success:true,result});}
const fetchImpl=async(url,options={})=>{
 calls.push({url,options});
 if(url.includes('.workers.dev/')){
  if(options.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'https://lukynovocz.github.io'}});
  if(url.endsWith('/v1/play-stats'))return Response.json({today:0,week:0,total:0});
  if(url.endsWith('/v1/scores'))return Response.json({items:[]});
  assert.equal(options.headers.Authorization,`Bearer ${env.IT_HERO_ADMIN_TOKEN}`);return Response.json({items:[]});
 }
 assert.equal(options.headers.Authorization,`Bearer ${env.CLOUDFLARE_API_TOKEN}`);
 const route=new URL(url).pathname;
 if(route.endsWith('/d1/database')&&options.method==='POST')return response({uuid:'test-db-uuid',name:'it-hero-community'});
 if(route.endsWith('/d1/database'))return response([]);
 if(route.endsWith('/workers/subdomain'))return response({subdomain:'test-account'});
 if(route.endsWith('/query')){assert(JSON.parse(options.body).sql.includes('CREATE TABLE IF NOT EXISTS dialogue_suggestions'));return response([{success:true}]);}
 if(route.endsWith('/secrets')){assert.equal(JSON.parse(options.body).text,env.IT_HERO_ADMIN_TOKEN);return response({});}
 if(route.endsWith('/scripts/it-hero-community')){
  assert(options.body instanceof FormData);const meta=JSON.parse(await options.body.get('metadata').text());assert.equal(meta.bindings[0].id,'test-db-uuid');assert(meta.keep_bindings.includes('secret_text'));assert(!JSON.stringify(meta).includes(env.IT_HERO_ADMIN_TOKEN));assert((await options.body.get('worker.mjs').text()).includes('export default'));return response({});
 }
 if(route.endsWith('/subdomain'))return response({enabled:true});
 throw Error('Unexpected route '+route);
};
const url=await deploy({env,fetchImpl,log:message=>logs.push(message)});assert.equal(url,'https://it-hero-community.test-account.workers.dev');assert(!logs.join('').includes(env.CLOUDFLARE_API_TOKEN));assert(!logs.join('').includes(env.IT_HERO_ADMIN_TOKEN));
assert(calls.find(c=>c.url.endsWith('/query')));assert(calls.find(c=>c.url.endsWith('/secrets')));
let changed=false;await assert.rejects(()=>deploy({env,fetchImpl:async()=>new Response(JSON.stringify({success:false,errors:[{code:10000}]}),{status:403}),log:()=>changed=true}),/HTTP 403/);assert.equal(changed,false);
await assert.rejects(()=>deploy({env:{...env,CLOUDFLARE_API_TOKEN:''},fetchImpl}),/chybí CLOUDFLARE_API_TOKEN/);
await assert.rejects(()=>deploy({env:{...env,IT_HERO_ADMIN_TOKEN:'short'},fetchImpl}),/kratší než 32/);
await assert.rejects(()=>deploy({env:{...env,IT_HERO_ADMIN_TOKEN:''},fetchImpl}),/GitHub nepředal/);
calls=[];await deploy({env,log:()=>{},fetchImpl:async(url,options={})=>{if(url.includes('/d1/database?'))return response([{uuid:'existing-db',name:'it-hero-community'}]);if(url.endsWith('/query')){assert(url.includes('existing-db'));return response([{success:true}]);}if(url.endsWith('/scripts/it-hero-community')){assert.equal(JSON.parse(await options.body.get('metadata').text()).bindings[0].id,'existing-db');return response({});}return fetchImpl(url,options);}});assert(!calls.some(c=>c.url.endsWith('/d1/database')&&c.options.method==='POST'));
console.log('PASS deploy preparation: mocked API flow, module upload/bindings, additive migration, existing DB reuse, private secrets, permission failure and missing credentials. No Cloudflare account was contacted.');
