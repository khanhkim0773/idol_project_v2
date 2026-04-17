const fs = require('fs');

async function restore() {
  const videos = JSON.parse(fs.readFileSync('/run/media/whale/Data/Fibonax/metaverse/idol_project_v2/backend/data/videos.json', 'utf8'));
  
  const res = await fetch('http://localhost:3004/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(videos.map(v => {
      // Remove any temporary properties that might not exist in Supabase
      delete v.isIdle; 
      return v;
    }))
  });
  
  const data = await res.json();
  console.log("Restore result:", data);
}

restore();
