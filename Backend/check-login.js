const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'hospital@pulsenet.com';
  const hospital = await Hospital.findOne({ email }).lean();
  console.log(JSON.stringify({ found: !!hospital, email, hospitalName: hospital && hospital.name, passwordHash: hospital && hospital.password }, null, 2));

  if (hospital) {
    const candidates = ['password123', 'hospital123', 'demo123', '123456', 'password', 'Pulsenet123'];
    for (const candidate of candidates) {
      const match = await bcrypt.compare(candidate, hospital.password);
      console.log(`${candidate}: ${match}`);
    }
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
