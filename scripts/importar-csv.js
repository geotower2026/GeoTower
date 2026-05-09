const mongoose = require("mongoose");
const fs = require("fs");
const { parse } = require("csv-parse");

const URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function rodar() {
  await mongoose.connect(URI);
  console.log("✅ Conectado");

  const db = mongoose.connection.db;

  let inseridos = 0;

  const parser = fs
    .createReadStream("C:/Users/Josinei/Documents/App/delivery-docs.deliveriess.csv")
    .pipe(parse({
      columns: true,              // transforma em objeto
      skip_empty_lines: true,
      relax_quotes: true,         // 🔥 aceita aspas quebradas
      relax_column_count: true,   // 🔥 aceita linha irregular
      trim: true
    }));

  for await (const row of parser) {
    try {
      const codigo = row.deliveryNumber;

      if (!codigo) continue;

      let documents = {};

      Object.keys(row).forEach((key) => {
        const value = row[key];

        if (typeof value === "string" && value.includes("uploads/")) {

          if (key.includes("retiradaCheio") && key.includes("url")) {
            documents.retiradaCheio = value;
          }

          if (key.includes("chegadaCliente") && key.includes("url")) {
            documents.chegadaCliente = value;
          }

          if (key.includes("inicioDesova") && key.includes("url")) {
            documents.inicioDesova = value;
          }

          if (key.includes("fimDesova") && key.includes("url")) {
            documents.fimDesova = value;
          }

          if (key.toLowerCase().includes("canhot")) {
            documents.canhoto = value;
          }
        }
      });

      const doc = {
        deliveryNumber: codigo,
        codigo: codigo,
        motorista: row.driverName || null,
        status: row.status || "IMPORTADO",
        placa: row.vehiclePlate || null,
        observacoes: row.observations || null,
        recebedor: row.recebedor || null,
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        documents
      };

      await db.collection("deliveries").updateOne(
        { deliveryNumber: codigo },
        { $set: doc },
        { upsert: true }
      );

      inseridos++;
      console.log("✔ Inserido:", codigo);

    } catch (err) {
      console.log("❌ Erro:", err.message);
    }
  }

  console.log("\n🚀 FINAL:", inseridos);
  process.exit();
}

rodar();
