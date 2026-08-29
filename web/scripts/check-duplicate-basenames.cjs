const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
console.log('Checking for duplicate-basename files in:', srcDir);

const map = new Map();

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const baseNoExt = fullPath.replace(/\.(js|jsx|ts|tsx)$/, '');
      if (!map.has(baseNoExt)) {
        map.set(baseNoExt, []);
      }
      map.get(baseNoExt).push(fullPath);
    }
  }
}

scan(srcDir);

const duplicates = [];
for (const [base, files] of map.entries()) {
  if (files.length > 1) {
    duplicates.push({ base, files });
  }
}

if (duplicates.length > 0) {
  console.error('\n❌ BUILD FAILED: DUPLICATE BASENAME FILES FOUND:');
  for (const dup of duplicates) {
    console.error(`- Base path: ${dup.base}`);
    for (const f of dup.files) {
      console.error(`    -> ${path.relative(srcDir, f)}`);
    }
  }
  console.error('\nPlease remove duplicate file variations so only one canonical file extension (.jsx or .js) exists per component.\n');
  process.exit(1);
} else {
  console.log('✅ No duplicate-basename files found in web/src.');
}
