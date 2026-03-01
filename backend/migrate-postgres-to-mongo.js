const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'MONGODB_URI_REMOVED';

const driverSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.Mixed,
  username: String,
  email: String,
  name: String,
  password: String,
  phone: String,
  isActive: Boolean,
  role: String,
  legacyPasswordSha256: String,
  transportadora: String,
  rastreador: String,
  expCadastroMotorista: String,
  cavalo: String,
  rastreadorCavalo: String,
  expCadastroCavalo: String,
  carreta: String,
  rastreadorCarreta: String,
  expCadastroCarreta: String,
  observacoes: String,
  vinculo: String,
  createdAt: Date,
  updatedAt: Date,
  deleted: Boolean,
  deletedAt: Date
}, { collection: 'drivers', timestamps: false });

const Driver = mongoose.model('Driver', driverSchema);

async function migrateDrivers() {
  try {
    console.log('🔌 Conectando ao MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado ao MongoDB');

    // Ler drivers do arquivo JSON
    const driversData = JSON.parse(fs.readFileSync('./drivers-backup.json', 'utf8'));
    console.log(`📋 Lidos ${driversData.length} drivers`);

    // Limpar dados e converter nomes de campos
    const cleanedDrivers = driversData.map(d => {
      // Remover aspas extras dos IDs
      let id = d.id;
      if (typeof id === 'string' && id.startsWith('"')) {
        id = id.replace(/^"|"$/g, '');
      }

      return {
        _id: id,
        username: d.username,
        email: d.email,
        name: d.name,
        password: d.password,
        phone: d.phone,
        isActive: d.isactive === true || d.isActive === true,
        role: d.role,
        legacyPasswordSha256: d.legacypasswordsha256 || d.legacyPasswordSha256,
        transportadora: d.transportadora,
        rastreador: d.rastreador,
        expCadastroMotorista: d.expcadastromotorista || d.expCadastroMotorista,
        cavalo: d.cavalo,
        rastreadorCavalo: d.rastreadorcavalo || d.rastreadorCavalo,
        expCadastroCavalo: d.expcadastrocavalo || d.expCadastroCavalo,
        carreta: d.carreta,
        rastreadorCarreta: d.rastreadorcarreta || d.rastreadorCarreta,
        expCadastroCarreta: d.expcadastrocarreta || d.expCadastroCarreta,
        observacoes: d.observacoes,
        vinculo: d.vinculo,
        createdAt: new Date(d.createdat),
        updatedAt: new Date(d.updatedat),
        deleted: d.deleted === true,
        deletedAt: d.deletedat ? new Date(d.deletedat) : null
      };
    });

    // Verificar se drivers já existem
    const existing = await Driver.countDocuments();
    console.log(`📊 Drivers já no MongoDB: ${existing}`);

    // Fazer replace/upsert de todos os drivers (ignorar duplicatas)
    let upserted = 0;
    let skipped = 0;
    
    for (const driver of cleanedDrivers) {
      try {
        const result = await Driver.updateOne(
          { _id: driver._id }, 
          { $set: driver }, 
          { upsert: true }
        );
        if (result.upserted) upserted++;
        else skipped++;
      } catch (err) {
        if (err.code === 11000) {
          console.warn(`⚠️ ${driver.username} já existe, pulando...`);
          skipped++;
        } else {
          throw err;
        }
      }
    }
    
    console.log(`✅ Migração concluída! ${upserted} novos + ${skipped} atualizados/pulados`);

    // Listar drivers importados
    const all = await Driver.find({});
    console.log(`\n📋 Total de drivers no MongoDB: ${all.length}`);
    all.forEach(d => console.log(`  - ${d.username} (${d.role})`));

    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

migrateDrivers();
