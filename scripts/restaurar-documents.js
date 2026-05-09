const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

const URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function rodar() {
  await mongoose.connect(URI);
  console.log("✅ Conectado");

  const db = mongoose.connection.db;

  const registros = [];

  // 📂 LÊ TEU CSV
  fs.createReadStream("delivery-docs.deliveriess.csv")
    .pipe(csv())
    .on("data", (row) => {
      registros.push(row);
    })
    .on("end", async () => {
      console.log("📊 Linhas lidas:", registros.length);

      for (let row of registros) {
        const codigo = row.codigo;

        if (!codigo) continue;

        let documents = {};

        // 🔍 PROCURA LINKS NA LINHA
        Object.values(row).forEach((value) => {
          if (typeof value === "string" && value.includes("uploads/")) {
            
            if (value.includes("RETIRADA")) {
              documents.retiradaCheio = value;
            }

            if (value.includes("CANHOTO")) {
              documents.canhoto = value;
            }

            if (value.includes("DESOVA")) {
              documents.inicioDesova = value;
            }

            if (value.includes("CLIENTE")) {
              documents.chegadaCliente = value;
            }
          }
        });

        if (Object.keys(documents).length > 0) {
          await db.collection("deliveries").updateOne(
            { codigo },
            {
              $set: { documents }
            }
          );
        }
      }

      console.log("♻️ Documents restaurados");
      process.exit();
    });
}

rodar();
