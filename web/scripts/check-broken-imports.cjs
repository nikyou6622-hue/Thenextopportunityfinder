const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
console.log('Checking for broken relative imports & missing exports in:', srcDir);

function getAllFiles(dir, fileList = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const sourceFiles = getAllFiles(srcDir);
const extensionsToTry = ['', '.jsx', '.js', '.tsx', '.ts', '/index.jsx', '/index.js', '/index.tsx', '/index.ts'];

const brokenList = [];

for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    const match = line.match(/from\s+['"]([^'"]+)['"]/) || line.match(/import\s+['"]([^'"]+)['"]/);
    if (!match) return;

    const specifier = match[1];
    if (specifier.startsWith('.')) {
      const fileDir = path.dirname(filePath);
      const targetBase = path.resolve(fileDir, specifier);

      let found = false;
      for (const ext of extensionsToTry) {
        const candidate = targetBase + ext;
        if (fs.existsSync(candidate) && !fs.statSync(candidate).isDirectory()) {
          found = true;
          break;
        }
      }

      if (!found) {
        brokenList.push({
          file: path.relative(srcDir, filePath),
          line: idx + 1,
          specifier
        });
      }
    }
  });
}

if (brokenList.length > 0) {
  console.error('\n❌ BUILD FAILED: BROKEN RELATIVE IMPORTS DETECTED:');
  for (const b of brokenList) {
    console.error(`  -> src/${b.file}:${b.line} imports '${b.specifier}' (file does not exist)`);
  }
  console.error('\nPlease fix or remove all broken imports before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All relative imports across web/src resolve cleanly.');
}
