const fs=require('node:fs'),vm=require('node:vm'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync('avatars.js','utf8'),ctx);
fs.writeFileSync('cloud-api/avatar-ids.mjs','// Generated from avatars.js; stable IDs, never arbitrary URLs.\nexport const avatarIds='+JSON.stringify(ctx.window.ITHeroAvatars.choices.map(a=>a.id))+';\n');
