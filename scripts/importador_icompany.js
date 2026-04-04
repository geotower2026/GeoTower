require("dotenv").config();

const xlsx = require("xlsx");
const { MongoClient } = require("mongodb");
const fs = require("fs");

// 📂 caminho do arquivo
const FILE_PATH = "C:/Icompany/IcompanyErpGeoLogisticaNuvem/data/ic_uldPc00800.xls";

// 🔗 conexão Mongo
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// 🧠 normalizar texto
function normalizar(txt) {
  if (!txt) return null;
  return txt.toString().trim().toUpperCase();
}

// 🚀 função principal
async function importar() {
  let mongo;

  try {
    mongo = new MongoClient(MONGO_URI);
    await mongo.connect();

    const db = mongo.db("delivery-docs");
    const col = db.collection("controle_protocolos");

    console.log("📂 Lendo Excel...");

    const wb = xlsx.readFile(FILE_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rows = xlsx.utils.sheet_to_json(sheet, {
      range: 1 // 👈 linha 2 como header
    });

    const mapa = {};

    for (const row of rows) {
      const processo = normalizar(row["Código do processo"]);
      const documento = normalizar(row["Descrição usuário"]);

      if (!processo || !documento) continue;

      if (!mapa[processo]) {
        mapa[processo] = {
          processo,
          container: row["Nº container"] || null,
          embarcador: row["Embarcador"] || null,
          destinatario: row["Destinatário"] || null,
          documentos: {}
        };
      }

      // 🔥 REGRA DO QNTD DOCUMENTO
      const qtd = Number(row["Qntd documento"]) || 0;

      mapa[processo].documentos[documento] = qtd > 0;
    }

    const lista = Object.values(mapa);

    console.log("📊 Processos encontrados:", lista.length);

    // 🔥 PEGA OS PROCESSOS DO EXCEL
    const processosExcel = [...new Set(lista.map(item => item.processo))];

    console.log("🧹 Atualizando processos do Excel...");

    // ❌ REMOVE SOMENTE OS PROCESSOS QUE VIERAM NO EXCEL
    const deleteResult = await col.deleteMany({
      processo: { $in: processosExcel }
    });

    console.log("🗑️ Removidos:", deleteResult.deletedCount);

    // ✅ INSERE NOVAMENTE OS DADOS ATUALIZADOS
    const agora = new Date();

    const docsToInsert = lista.map(item => ({
      ...item,
      createdAt: agora,
      updatedAt: agora
    }));

    if (docsToInsert.length > 0) {
      const insertResult = await col.insertMany(docsToInsert);
      console.log("📥 Inseridos:", Object.keys(insertResult.insertedIds).length);
    } else {
      console.log("⚠️ Nenhum dado para inserir");
    }

    console.log("✅ Importação finalizada\n");

  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    if (mongo) await mongo.close();
  }
}

// 👀 MONITORAMENTO DO ARQUIVO

let ultimaModificacao = 0;

if (fs.existsSync(FILE_PATH)) {
  ultimaModificacao = fs.statSync(FILE_PATH).mtimeMs;
}

// 🚀 roda ao iniciar
importar();

// 🔁 verifica a cada 5 segundos
setInterval(() => {
  try {
    if (!fs.existsSync(FILE_PATH)) return;

    const stats = fs.statSync(FILE_PATH);

    if (stats.mtimeMs !== ultimaModificacao) {
      ultimaModificacao = stats.mtimeMs;

      console.log("📥 Arquivo atualizado!");
      importar();
    }
  } catch (error) {
    console.error("❌ Erro no monitor:", error);
  }
}, 5000);