/* The deploy job calls this only after authenticated API health checks succeed. */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export async function connect({url,root=fileURLToPath(new URL('../',import.meta.url)),sourceCommit=process.env.GITHUB_SHA||''}){
 if(!/^https:\/\/it-hero-community\.[a-z0-9-]+\.workers\.dev\/?$/.test(url||''))throw Error('Chybí ověřená veřejná workers.dev adresa.');
 const base=url.replace(/\/$/,''),version=createHash('sha256').update(base).digest('hex').slice(0,12);
 const config=`/* Public API URL. Private keys belong only to repository/Worker secrets. */\nwindow.ITHeroCommunityConfig=window.ITHeroCommunityConfig||${JSON.stringify({apiBaseUrl:base})};\n`;
 await fs.writeFile(path.join(root,'community-config.js'),config);
 for(const file of ['dialogue-suggestions.html','dialogue-admin.html']){
  const target=path.join(root,file),html=await fs.readFile(target,'utf8');if(!/community-config\.js\?v=[^"']+/.test(html))throw Error(`Chybí odkaz na konfiguraci v ${file}.`);
  await fs.writeFile(target,html.replace(/community-config\.js\?v=[^"']+/g,`community-config.js?v=cloud-${version}`));
 }
 await fs.writeFile(path.join(root,'cloud-api/deployment.json'),JSON.stringify({apiBaseUrl:base,verifiedAt:new Date().toISOString(),sourceCommit},null,2)+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))connect({url:process.env.COMMUNITY_API_URL}).catch(error=>{console.error(error.message);process.exitCode=1;});
