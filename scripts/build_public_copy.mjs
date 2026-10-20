import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog} from '../cloud-api/character-groups.mjs';
import {avatarIds} from '../cloud-api/avatar-ids.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
export async function buildPublicCopy(destination){
 const out=path.resolve(destination);
 if(out===root||root.startsWith(out+path.sep))throw Error('Choose a separate distribution directory.');
 await fs.mkdir(out,{recursive:true});
 if((await fs.readdir(out)).length)throw Error('Distribution directory must be empty.');
 const pending=['index.html','character-preview.html','dialogue-suggestions.html','dialogue-admin.html'];
 const included=new Set();
 while(pending.length){
  const name=pending.shift();if(included.has(name))continue;
  if(!/^[a-zA-Z0-9_./-]+\.(?:html|js|css|png|txt)$/.test(name)||name.includes('..'))throw Error('Unexpected asset path.');
  included.add(name);let bytes=await fs.readFile(path.join(root,name));
  if(name==='community-config.js')bytes=Buffer.from('window.ITHeroCommunityConfig={apiBaseUrl:location.origin};\n');
  if(/\.(html|js|css)$/.test(name)){
   let text=bytes.toString();
   if(name==='index.html')text=text.replace(/\s*<p><a href="ending-(?:preview|storyboard)\.html">.*?<\/a><\/p>/g,'');
   if(name.endsWith('.html')){
    text=text.replace('<head>','<head><meta name="robots" content="noindex,nofollow,noarchive">');
    for(const match of text.matchAll(/(?:src|href)=["']([^"'#?]+)(?:\?[^"']*)?["']/g)){
     if(/^(?:https?:|\/\/|mailto:)/i.test(match[1]))throw Error('External link in public page.');
     if(/\.(?:html|js|css)$/.test(match[1]))pending.push(match[1]);
    }
   }
   for(const match of text.matchAll(/assets\/[a-zA-Z0-9_./-]+\.png/g))pending.push(match[0]);
   if(/lukynovo|l-baborak|baborak@|github\.com\/LukynovoCZ|github\.io/i.test(text))throw Error(`Personal reference in ${name}`);
   bytes=Buffer.from(text);
  }
  if(name.endsWith('.png')){
   // Remove text, timestamps and EXIF without changing image pixels.
   const chunks=[bytes.subarray(0,8)];let i=8;
   while(i<bytes.length){const end=i+12+bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8);if(!['tEXt','zTXt','iTXt','eXIf','tIME'].includes(type))chunks.push(bytes.subarray(i,end));i=end;}
   bytes=Buffer.concat(chunks);
  }
  await fs.mkdir(path.dirname(path.join(out,name)),{recursive:true});await fs.writeFile(path.join(out,name),bytes);
 }
 await fs.copyFile(path.join(root,'vendor/PHASER-LICENSE.txt'),path.join(out,'vendor/PHASER-LICENSE.txt'));
 await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
 await fs.writeFile(path.join(out,'404.html'),'<!doctype html><html lang="cs"><meta charset="utf-8"><title>Stránka nenalezena</title><p>Stránka nenalezena. <a href="/">Zpět do hry</a></p></html>');
 await fs.writeFile(path.join(out,'_headers'),'/*\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
 let api=await fs.readFile(path.join(root,'cloud-api/worker.mjs'),'utf8');
 api=api.replace("import {avatarIds} from './avatar-ids.mjs';",`const avatarIds=${JSON.stringify(avatarIds)};`).replace("import {catalog} from './character-groups.mjs';",`const catalog=${JSON.stringify(catalog)};`).replace('export default {async fetch','const communityHandler={async fetch');
 const gateway=`\nexport default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/v1/'))return communityHandler.fetch(request,{...env,ALLOWED_ORIGIN:url.origin});
 const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);
 headers.set('Referrer-Policy','no-referrer');headers.set('X-Content-Type-Options','nosniff');headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
 return new Response(response.body,{status:response.status,headers});
}};\n`;
 await fs.writeFile(path.join(out,'_worker.js'),api+gateway);
 await fs.writeFile(path.join(out,'_routes.json'),JSON.stringify({version:1,include:['/*'],exclude:[]}));
 return [...included].sort();
}
if(process.argv[1]===fileURLToPath(import.meta.url)){await buildPublicCopy(process.argv[2]);console.log('Clean public distribution built.');}
