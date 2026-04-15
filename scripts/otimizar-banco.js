const mongoose = require("mongoose");

async function rodar() {
  try {
    await mongoose.connect("MONGODB_URI_REMOVED");
    console.log("✅ Conectado");

    const db = mongoose.connection.db;

    // =====================================
    // 1. LIMPAR ARRAYS BUGADOS (TEU CASO)
    // =====================================
    const limparArrays = await db.collection("deliveries").updateMany(
      {
        $or: [
          { "documents.chegadaCliente.1": { $exists: true } },
          { "documents.inicioDesova.1": { $exists: true } },
          { "documents.retiradaCheio.1": { $exists: true } },
          { "documents.fimDesova.1": { $exists: true } }
        ]
      },
      {
        $set: {
          "documents.chegadaCliente": {
            $cond: [
              { $isArray: "$documents.chegadaCliente" },
              { $arrayElemAt: ["$documents.chegadaCliente", 0] },
              "$documents.chegadaCliente"
            ]
          },
          "documents.inicioDesova": {
            $cond: [
              { $isArray: "$documents.inicioDesova" },
              { $arrayElemAt: ["$documents.inicioDesova", 0] },
              "$documents.inicioDesova"
            ]
          },
          "documents.retiradaCheio": {
            $cond: [
              { $isArray: "$documents.retiradaCheio" },
              { $arrayElemAt: ["$documents.retiradaCheio", 0] },
              "$documents.retiradaCheio"
            ]
          },
          "documents.fimDesova": {
            $cond: [
              { $isArray: "$documents.fimDesova" },
              { $arrayElemAt: ["$documents.fimDesova", 0] },
              "$documents.fimDesova"
            ]
          }
        }
      }
    );

    console.log("🧹 Arrays corrigidos:", limparArrays.modifiedCount);

    // =====================================
    // 2. SIMPLIFICAR DOCUMENTS (DEIXAR SÓ URL)
    // =====================================
    const simplificarDocs = await db.collection("deliveries").updateMany(
      {},
      [
        {
          $set: {
            documents: {
              retiradaCheio: "$documents.retiradaCheio.url",
              chegadaCliente: "$documents.chegadaCliente.url",
              inicioDesova: "$documents.inicioDesova.url",
              fimDesova: "$documents.fimDesova.url",
              canhoto: "$documents.canhoto.url"
            }
          }
        }
      ]
    );

    console.log("⚡ Documents simplificados:", simplificarDocs.modifiedCount);

    // =====================================
    // 3. REMOVER CAMPOS LIXO
    // =====================================
    const limparCampos = await db.collection("deliveries").updateMany(
      {},
      {
        $unset: {
          __v: "",
          documentCorrectionLog: "",
          missingDocumentsAtSubmit: "",
          logs: "",
          debug: ""
        }
      }
    );

    console.log("🧹 Campos removidos:", limparCampos.modifiedCount);

    // =====================================
    // 4. REMOVER DUPLICADOS (POR CODIGO)
    // =====================================
    const duplicados = await db.collection("deliveries").aggregate([
      {
        $group: {
          _id: "$codigo",
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    let removidos = 0;

    for (let doc of duplicados) {
      const idsParaRemover = doc.ids.slice(1);
      const res = await db.collection("deliveries").deleteMany({
        _id: { $in: idsParaRemover }
      });
      removidos += res.deletedCount;
    }

    console.log("🗑️ Duplicados removidos:", removidos);

    // =====================================
    // 5. CRIAR INDEX (PERFORMANCE)
    // =====================================
    await db.collection("deliveries").createIndex({ codigo: 1 });
    await db.collection("deliveries").createIndex({ processo: 1 });
    await db.collection("deliveries").createIndex({ status: 1 });
    await db.collection("deliveries").createIndex({ motorista: 1 });
    await db.collection("deliveries").createIndex({ createdAt: -1 });

    console.log("⚡ Índices criados");

    console.log("🚀 OTIMIZAÇÃO FINALIZADA");
    process.exit();

  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
}

rodar();