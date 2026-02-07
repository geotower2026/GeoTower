const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS = path.join(__dirname, '..', 'uploads');
const DB = path.join(__dirname, '..', 'data', 'db.json');
const REPORTS_DIR = path.join(__dirname, 'reports');

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function hashFile(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (err) {
    return null;
  }
}

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
  const referenced = loadReferenced();
  const files = walk(UPLOADS);

  const orphans = files.filter(f => !referenced.has(f.rel)).map(f => ({ rel: f.rel, size: f.size, mtime: f.mtime.toISOString(), hash: hashFile(f.full) }));

  // group by basename
  const byBase = {};
  orphans.forEach(o => {
    const b = path.basename(o.rel);
    byBase[b] = byBase[b] || [];
    byBase[b].push(o);
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `orphans-${timestamp}.json`);
  const report = { runAt: new Date().toISOString(), totalOrphans: orphans.length, orphans, duplicatesByBasename: Object.entries(byBase).filter(([,arr])=>arr.length>1).map(([name,arr])=>({ name, count: arr.length, files: arr })) };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Orphans found:', orphans.length);
  console.log('Report written to', reportPath);
}

main();
