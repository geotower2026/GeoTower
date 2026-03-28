// Temporary script to inspect Ycompany document keys
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Ycompany = require('../src/models/Ycompany');

const uri = process.env.MONGODB_URI || 'MONGODB_URI_REMOVED';

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('connected to db');
    const rec = await Ycompany.findOne().lean();
    console.log('sample record:', rec);
    console.log('fields:', Object.keys(rec));
    process.exit(0);
  })
  .catch((err) => {
    console.error('db error', err);
    process.exit(1);
  });
