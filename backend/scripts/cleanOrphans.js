const fs = require('fs');
const path = require('path');

const UPLOADS = path.join(__dirname, '..', 'uploads');
const DB = path.join(__dirname, '..', 'data', 'db.json');
const REPORTS_DIR = path.join(__dirname, 'reports');
const DAYS = 90;

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function walk(dir) {
  const out = [];
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push({ full, rel: path.relative(UPLOADS, full).replace(/\\/g, '/'), mtime: stat.mtime, size: stat.size });
    }
  });
  return out;
}

function loadReferenced() {
  const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
  const referenced = new Set();
  (db.deliveries || []).forEach(del => {
    const docs = del.documents || {};
    Object.values(docs).forEach(v => {
      if (!v) return;
      if (Array.isArray(v)) v.forEach(x => referenced.add(x));
      else referenced.add(v);
    });
  });
  return referenced;
}

function main() {
  const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const referenced = loadReferenced();
  const files = walk(UPLOADS);

  const candidates = files.filter(f => {
    const isOrphan = !referenced.has(f.rel);
    const isOld = f.mtime.getTime() < cutoff;
    return isOrphan && isOld;
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `deleted-orphans-${timestamp}.json`);

  const deleted = [];

  candidates.forEach(f => {
    try {
      fs.unlinkSync(f.full);
      deleted.push({ rel: f.rel, size: f.size, mtime: f.mtime.toISOString() });
    } catch (err) {
      console.error('Erro ao deletar', f.full, err.message);
    }
  });

  const report = {
    runAt: new Date().toISOString(),
    cutoffDays: DAYS,
    totalFilesOnDisk: files.length,
    totalDeleted: deleted.length,
    deleted
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Deleted files:', deleted.length);
  console.log('Report written to', reportPath);
}

main();
