import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function convertFileToESM(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Store original for comparison
  const original = content;
  
  // Replace require() statements
  // const X = require("path") → import X from "path.js"
  content = content.replace(/const\s+(\w+)\s*=\s*require\("([^"]+)"\);?/g, (match, varName, modulePath) => {
    if (modulePath.startsWith(".")) {
      return `import ${varName} from "${modulePath}.js";`;
    }
    return `import ${varName} from "${modulePath}";`;
  });

  // const { X, Y } = require("path") → import { X, Y } from "path.js"
  content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\("([^"]+)"\);?/g, (match, exports, modulePath) => {
    if (modulePath.startsWith(".")) {
      return `import { ${exports} } from "${modulePath}.js";`;
    }
    return `import { ${exports} } from "${modulePath}";`;
  });

  // module.exports = { ... } → export default { ... }
  content = content.replace(/module\.exports\s*=\s*\{/, "export default {");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Converted: ${filePath}`);
    return true;
  }
  console.log(`- Skipped: ${filePath} (no changes)`);
  return false;
}

function processDirectory(dir, extensions = ['.js']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, extensions);
    } else if (extensions.includes(path.extname(file))) {
      convertFileToESM(filePath);
    }
  }
}

// Convert specific directories
const dirs = [
  path.join(__dirname, 'src/infrastructure/controllers'),
  path.join(__dirname, 'src/infrastructure/repositories'),
  path.join(__dirname, 'src/infrastructure/db'),
  path.join(__dirname, 'src/infrastructure/security'),
  path.join(__dirname, 'src/infrastructure/routes'),
  path.join(__dirname, 'src/application/use-cases'),
  path.join(__dirname, 'src/shared'),
];

console.log('Starting conversion to ES modules...\n');

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    console.log(`\nProcessing: ${dir}`);
    processDirectory(dir);
  }
}

console.log('\n✓ Conversion complete!');
