const fs = require('fs');
const videos = JSON.parse(fs.readFileSync('/run/media/whale/Data/Fibonax/metaverse/idol_project_v2/backend/data/videos.json', 'utf8'));
const idols = JSON.parse(fs.readFileSync('/run/media/whale/Data/Fibonax/metaverse/idol_project_v2/backend/data/idols.json', 'utf8'));

const idol = idols[0]; // Mai Anh

const idolVideos = videos
  .filter((v) => v.idolId === idol.id)
  .sort((a,b) => a.order - b.order);

const idleVideos = idolVideos.filter(v => v.isIdle);
const giftVideos = idolVideos.filter(v => !v.isIdle);

console.log("Idol:", idol.id);
console.log("Total idolVideos:", idolVideos.length);
console.log("Idle:", idleVideos.length);
console.log("Gift:", giftVideos.length);
