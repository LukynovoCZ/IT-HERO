import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

export function resetSQL({resetId,name,score}){
 if(!/^[a-z0-9-]{1,80}$/.test(resetId)||!/^\w{1,12}$/.test(name)||!Number.isSafeInteger(score)||score<0||score>100000)throw Error('Invalid reset request.');
 const id=`'${resetId}'`,player=`'${name}'`,pending=`NOT EXISTS (SELECT 1 FROM arcade_score_resets WHERE reset_id=${id} AND completed_at IS NOT NULL)`;
 return `
CREATE TABLE IF NOT EXISTS arcade_score_resets(reset_id TEXT PRIMARY KEY, scores_json TEXT NOT NULL, avatars_json TEXT NOT NULL, completed_at INTEGER);
INSERT INTO arcade_score_resets(reset_id,scores_json,avatars_json)
SELECT ${id},COALESCE((SELECT json_group_array(json_object('id',id,'request_id',request_id,'name',name,'score',score,'elapsed_ms',elapsed_ms,'created_at',created_at)) FROM arcade_scores),'[]'),COALESCE((SELECT json_group_array(json_object('request_id',request_id,'avatar_id',avatar_id)) FROM arcade_score_avatars),'[]')
WHERE NOT EXISTS (SELECT 1 FROM arcade_score_resets WHERE reset_id=${id});
DELETE FROM arcade_score_avatars WHERE ${pending};
DELETE FROM arcade_scores WHERE ${pending};
INSERT INTO arcade_scores(request_id,name,score,elapsed_ms,created_at)
SELECT ${id},${player},${score},COALESCE((SELECT json_extract(value,'$.elapsed_ms') FROM arcade_score_resets,json_each(scores_json) WHERE reset_id=${id} AND lower(json_extract(value,'$.name'))=lower(${player}) AND json_extract(value,'$.score')=${score} LIMIT 1),0),unixepoch()
WHERE ${pending};
INSERT INTO arcade_score_avatars(request_id,avatar_id)
SELECT ${id},COALESCE((SELECT json_extract(a.value,'$.avatar_id') FROM arcade_score_resets r,json_each(r.scores_json) s,json_each(r.avatars_json) a WHERE r.reset_id=${id} AND lower(json_extract(s.value,'$.name'))=lower(${player}) AND json_extract(s.value,'$.score')=${score} AND json_extract(a.value,'$.request_id')=json_extract(s.value,'$.request_id') LIMIT 1),'hero')
WHERE ${pending};
UPDATE arcade_score_resets SET completed_at=unixepoch() WHERE reset_id=${id} AND completed_at IS NULL;
SELECT name,score FROM arcade_scores ORDER BY score DESC,created_at,id;
`;
}

export async function resetSharedScores(){
 const account=process.env.CLOUDFLARE_ACCOUNT_ID,token=process.env.CLOUDFLARE_API_TOKEN;
 if(!account||!token)throw Error('Cloudflare credentials missing.');
 const request=JSON.parse(await fs.readFile(new URL('../cloud-api/score-reset-request.json',import.meta.url),'utf8'));
 const sql=resetSQL(request);
 async function api(route,body){
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${route}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000)});
  const data=await response.json();if(!response.ok||!data.success)throw Error(`Cloudflare D1 HTTP ${response.status}; codes ${(data.errors||[]).map(e=>e.code).join(',')}`);return data.result;
 }
 let database;for(let page=1;page<=100;page++){const list=await api(`/d1/database?per_page=100&page=${page}`);database=list.find(d=>d.name==='it-hero-community');if(database||list.length<100)break;}
 if(!database)throw Error('Existing database not found.');
 const result=await api(`/d1/database/${database.uuid}/query`,{sql});if(result.some(r=>r.success===false))throw Error('Reset query was not successful.');
 const check=await api(`/d1/database/${database.uuid}/query`,{sql:'SELECT name,score FROM arcade_scores ORDER BY score DESC,created_at,id;'});
 const rows=check[0]?.results;if(rows?.length!==1||rows[0].name!==request.name||rows[0].score!==request.score)throw Error('Reset verification failed.');
 console.log(`Verified shared Hall of Fame: ${request.name}, ${request.score} points, one real entry. Previous records backed up privately in D1. Feedback and play statistics unchanged.`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))resetSharedScores().catch(e=>{console.error(`::error title=Hall of Fame reset::${e.message}`);process.exitCode=1;});
