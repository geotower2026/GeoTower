const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('Running analyzeUploads.js, cwd=', process.cwd());
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const dbFile = path.join(__dirname, '..', 'data', 'db.json');

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(data).digest('hex');
}

function walk(dir) {
  const res = [];
  const items = fs.readdirSync(dir);
  items.forEach(i => {
    const full = path.join(dir, i);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full).forEach(x => res.push(x));
    } else {
      res.push(full);
    }
  });
  return res;
}

function main() {
  const allFiles = walk(uploadsRoot);

  const filesInfo = allFiles.map(f => ({
    full: f,
    rel: path.relative(uploadsRoot, f).replace(/\\\\/g, '/'),
    size: fs.statSync(f).size,
    mtime: fs.statSync(f).mtime.toISOString(),
    hash: hashFile(f)
  }));

  const byHash = {};
  filesInfo.forEach(fi => {
    byHash[fi.hash] = byHash[fi.hash] || [];
    byHash[fi.hash].push(fi);
  });

  const duplicates = Object.values(byHash).filter(arr => arr.length > 1);

  const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  const referenced = new Set();
  (db.deliveries || []).forEach(del => {
    const docs = del.documents || {};
    Object.values(docs).forEach(v => {
      if (!v) return;
      if (Array.isArray(v)) v.forEach(x => referenced.add(x));
      else referenced.add(v);
    });
  });

  const onDiskSet = new Set(filesInfo.map(f => f.rel));

  const orphans = filesInfo.filter(f => !referenced.has(f.rel));
  const missing = [...referenced].filter(r => !onDiskSet.has(r));

  console.log('--- Summary ---');
  console.log('Total files on disk:', filesInfo.length);
  console.log('Total referenced in DB:', referenced.size);
  console.log('Orphan files (on disk, not referenced):', orphans.length);
  console.log('Missing files (referenced but not on disk):', missing.length);
  console.log('Duplicate groups (same content):', duplicates.length);

  if (orphans.length) {
    console.log('\n--- Orphan files sample (first 30) ---');
    orphans.slice(0, 30).forEach(f => console.log(f.rel, f.size, f.mtime));
  }

  if (missing.length) {
    console.log('\n--- Missing files sample (first 30) ---');
    missing.slice(0, 30).forEach(x => console.log(x));
  }

  if (duplicates.length) {
    console.log('\n--- Duplicate groups (hash) ---');
    duplicates.forEach(group => {
      console.log('Group hash:', group[0].hash);
      group.forEach(g => console.log('  ', g.rel, g.size, g.mtime));
    });
  }
}

main();
