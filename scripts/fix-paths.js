/**
 * 修复构建后的文件路径
 * 将绝对路径改为相对路径，确保在GitHub Pages上正常工作
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // 替换绝对路径为相对路径
  html = html.replace(/href="\/assets\//g, 'href="./assets/');
  html = html.replace(/src="\/assets\//g, 'src="./assets/');
  
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✅ 路径修复完成');
  
  // 显示修复后的内容
  console.log('\n修复后的HTML片段:');
  const matches = html.match(/<script[^>]*src="[^"]*"[^>]*>|<link[^>]*href="[^"]*"[^>]*>/g);
  if (matches) {
    matches.forEach(match => console.log('  ' + match));
  }
} else {
  console.error('❌ dist/index.html 不存在');
  process.exit(1);
}
