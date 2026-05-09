const mongoose = require("mongoose");

async function rodar() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log("✅ Conectado");

  const db = mongoose.connection.db;

  const result = await db.collection("deliveries").updateMany(
    {
      $or: [
        { "documents.chegadaCliente.1": { $exists: true } },
        { "documents.inicioDesova.1": { $exists: true } }
      ]
    },
    [
      {
        $set: {
          "documents.chegadaCliente": {
            $slice: ["$documents.chegadaCliente", 1]
          },
          "documents.inicioDesova": {
            $slice: ["$documents.inicioDesova", 1]
          }
        }
      }
    ]
  );

  console.log("🚀 Atualizados:", result.modifiedCount);
  process.exit();
}

rodar();
