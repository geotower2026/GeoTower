const uri = process.argv[2];
if (!uri) {
  console.error('NO_URI_PROVIDED');
  process.exit(1);
}
const mongoose = require('mongoose');
(async () => {
  try {
    await mongoose.connect(uri);
    const Driver = require('./src/models/Driver');
    const c = await Driver.countDocuments();
    console.log('DRIVERS_COUNT:', c);
    await mongoose.disconnect();
  } catch (e) {
    console.error('ERR', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
