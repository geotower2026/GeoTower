const crypto = require('crypto');
const pwd = process.argv[2] || 'geomar123';
console.log(crypto.createHash('sha256').update(pwd).digest('hex'));
