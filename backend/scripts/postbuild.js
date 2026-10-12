const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Generate entry point bridging dist/server.js to dist/backend/src/server.js
const entryContent = `require('./backend/src/server.js');\n`;
fs.writeFileSync(path.join(distDir, 'server.js'), entryContent, 'utf8');
console.log('✅ Successfully created dist/server.js entrypoint');
