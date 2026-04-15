const mongoose = require("mongoose");
const XLSX = require("xlsx");

const URI = "MONGODB_URI_REMOVED";

async function rodar() {
  await mongoose.connect(URI);
  console.log("✅ Conectado");

  const db = mongoose.connection.db;

  const workbook = XLSX.readFile("C:/Users/Josinei/Documents/App/delivery-docs.deliveriess.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(sheet);

  let atualizados = 0;

  for (let row of data) {
    try {
      const codigo = row.deliveryNumber;

      if (!codigo) continue;

      let documents = {};

      // 🔍 pegar URLs
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

        // 🔥 CAMPOS CORRETOS AGORA
        motorista: row.driverName || null,
        status: row.status || "IMPORTADO",
        placa: row.vehiclePlate || null,

        observacoes: row.observations || null,
        recebedor: row.recebedor || null,

        // 🔥 DATAS CORRETAS
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        deliveryDate: row.deliveryDate ? new Date(row.deliveryDate) : null,
        arrivedAt: row.arrivedAt ? new Date(row.arrivedAt) : null,
        desovaStartAt: row.desovaStartAt ? new Date(row.desovaStartAt) : null,
        desovaEndAt: row.desovaEndAt ? new Date(row.desovaEndAt) : null,

        documents
      };

      await db.collection("deliveries").updateOne(
        { deliveryNumber: codigo },
        { $set: doc },
        { upsert: true }
      );

      atualizados++;
      console.log("✔ Atualizado:", codigo);

    } catch (err) {
      console.log("❌ Erro:", err.message);
    }
  }

  console.log("\n🚀 FINAL:", atualizados);
  process.exit();
}

rodar();