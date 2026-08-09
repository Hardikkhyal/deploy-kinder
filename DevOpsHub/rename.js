const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        replaceInDir(fullPath);
      }
    } else {
      if (['.ts', '.tsx', '.html', '.md', '.json', '.css'].includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/DevOpsHub/gi, 'Selfhost');
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Updated: ' + fullPath);
        }
      }
    }
  }
}

replaceInDir('d:/project/DevOpsHub/frontend');
replaceInDir('d:/project/DevOpsHub/backend');
replaceInDir('d:/project/DevOpsHub/college_project_report.md'); // Oh wait, this is a file not a dir! I'll fix this below.

if (fs.existsSync('d:/project/DevOpsHub/college_project_report.md')) {
    let content = fs.readFileSync('d:/project/DevOpsHub/college_project_report.md', 'utf8');
    let newContent = content.replace(/DevOpsHub/gi, 'Selfhost');
    if (newContent !== content) {
        fs.writeFileSync('d:/project/DevOpsHub/college_project_report.md', newContent, 'utf8');
        console.log('Updated: d:/project/DevOpsHub/college_project_report.md');
    }
}
