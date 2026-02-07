const fs = require('fs');
const path = require('path');

const UPLOADS = path.join(__dirname, '..', 'uploads');
const REPORTS_DIR = path.join(__dirname, 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function walkDirs(dir) {
  const dirs = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.push(full);
      dirs.push(...walkDirs(full));
    }
  });
  return dirs;
}

function dirHasFilesRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile()) return true;
    if (e.isDirectory()) {
      if (dirHasFilesRecursively(full)) return true;
    }
  }
  return false;
}

function main() {
  const allDirs = walkDirs(UPLOADS);
  const byBase = {};
  allDirs.forEach(d => {
    const base = path.basename(d).toLowerCase();
    byBase[base] = byBase[base] || [];
    byBase[base].push(d);
  });

  const duplicateGroups = Object.entries(byBase).filter(([, arr]) => arr.length > 1);

  const toDelete = [];

  duplicateGroups.forEach(([base, arr]) => {
    arr.forEach(dirPath => {
      try {
        const hasFiles = dirHasFilesRecursively(dirPath);
        if (!hasFiles) {
          toDelete.push(dirPath);
        }
      } catch (err) {
        console.error('Erro checando dir', dirPath, err.message);
      }
    });
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `removed-empty-duplicate-folders-${timestamp}.json`);

  const deleted = [];
  toDelete.forEach(dirPath => {
    try {
      // Only remove if still empty
      if (!dirHasFilesRecursively(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: false });
        deleted.push(dirPath.replace(/\\/g, '/'));
      }
    } catch (err) {
      console.error('Erro ao deletar pasta', dirPath, err.message);
    }
  });

  const report = {
    runAt: new Date().toISOString(),
    totalDirsScanned: allDirs.length,
    duplicateGroups: duplicateGroups.length,
    candidatesFound: toDelete.length,
    deletedCount: deleted.length,
    deleted
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Duplicate groups: ${report.duplicateGroups}`);
  console.log(`Candidates empty dirs: ${report.candidatesFound}`);
  console.log(`Deleted count: ${report.deletedCount}`);
  console.log('Report:', reportPath);
}

main();
