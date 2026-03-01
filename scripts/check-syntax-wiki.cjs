const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const docsOutputPath = path.join(repoRoot, 'docs', 'syntax-wiki.md');
const appOutputPath = path.join(repoRoot, 'src', 'content', 'syntax-wiki.md');

const readFileSafe = (targetPath) => (fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '');

const beforeDocs = readFileSafe(docsOutputPath);
const beforeApp = readFileSafe(appOutputPath);

const run = spawnSync(process.execPath, [path.join(__dirname, 'generate-syntax-wiki.cjs')], {
  cwd: repoRoot,
  stdio: 'pipe',
  encoding: 'utf8',
});

if (run.status !== 0) {
  const details = `${run.stdout || ''}${run.stderr || ''}`.trim();
  console.error(details || 'failed to run syntax wiki generator');
  process.exit(run.status || 1);
}

const afterDocs = readFileSafe(docsOutputPath);
const afterApp = readFileSafe(appOutputPath);
const docsChanged = beforeDocs !== afterDocs;
const appChanged = beforeApp !== afterApp;

if (docsChanged || appChanged) {
  console.error('syntax wiki is out of date. Run: npm run docs:syntax');
  if (docsChanged) {
    console.error('- docs/syntax-wiki.md changed');
  }
  if (appChanged) {
    console.error('- src/content/syntax-wiki.md changed');
  }
  process.exit(1);
}

console.log('syntax wiki is up to date');
