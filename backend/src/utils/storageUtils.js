const fs = require('fs');
const path = require('path');
const s3 = process.env.S3_BUCKET ? require('../storage/s3') : null;

function normalizeEntries(entry) {
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (typeof entry === 'string') {
    // legacy: comma-separated string
    if (entry.indexOf(',') !== -1) return entry.split(',').map(s => s.trim()).filter(Boolean);
    return [entry];
  }
  return [];
}

async function deleteDeliveryFiles(delivery) {
  const docs = delivery.documents || {};
  const city = delivery.city || 'manaus';
  const removed = [];

  for (const [type, entry] of Object.entries(docs)) {
    if (!entry) continue;
    const entries = normalizeEntries(entry);
    for (const rel of entries) {
      if (!rel) continue;
      if (typeof rel === 'string' && rel.startsWith && rel.startsWith('http') && s3) {
        try {
          const url = new URL(rel);
          const key = url.pathname.replace(/^\//, '');
          await s3.deleteKey(key);
          removed.push(rel);
        } catch (err) {
          console.warn('Failed to delete S3 key for', rel, err.message || err);
        }
      } else {
        // Try BACKEND_UPLOADS_DIR first
        const base = process.env.BACKEND_UPLOADS_DIR ? path.resolve(process.env.BACKEND_UPLOADS_DIR) : path.join(__dirname, '..', 'uploads');
        const candidate1 = path.join(base, city, rel);
        const candidate2 = path.join(base, rel);
        try {
          if (fs.existsSync(candidate1)) { fs.unlinkSync(candidate1); removed.push(candidate1); }
          else if (fs.existsSync(candidate2)) { fs.unlinkSync(candidate2); removed.push(candidate2); }
        } catch (err) {
          console.warn('Failed to unlink file', rel, err.message || err);
        }
      }
    }
  }

  return removed;
}

function normalizeDeliveryForResponse(delivery) {
  if (!delivery) return delivery;
  const d = JSON.parse(JSON.stringify(delivery));
  d.documents = d.documents || {};
  
  for (const [k, v] of Object.entries(d.documents)) {
    if (!v) { 
      d.documents[k] = null; 
      continue; 
    }
    
    let result = null;
    
    // Handle string (could be JSON)
    if (typeof v === 'string') {
      try {
        result = JSON.parse(v);
      } catch (e) {
        // Not JSON, treat as single entry
        result = [v];
      }
    }
    // Handle array
    else if (Array.isArray(v)) {
      result = v;
    }
    // Handle object
    else if (typeof v === 'object') {
      result = [v];
    } else {
      result = [v];
    }
    
    // Ensure result is array and parse nested JSON if present
    if (!Array.isArray(result)) {
      result = [result];
    }
    
    // Parse array elements if they are JSON strings
    const parsed = result.map(el => {
      if (typeof el === 'string') {
        try {
          return JSON.parse(el);
        } catch (e) {
          return el;
        }
      }
      return el;
    });
    
    d.documents[k] = parsed;
  }
  
  return d;
}

module.exports = {
  deleteDeliveryFiles,
  normalizeEntries,
  normalizeDeliveryForResponse
};