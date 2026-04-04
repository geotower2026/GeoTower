const {MongoClient}=require('mongodb');
const uri=process.env.MONGODB_URI||'mongodb://localhost:27017/logistica';
const dbName=process.env.MONGO_DB||'delivery-docs';

(async()=>{
  try {
    const c=new MongoClient(uri);
    await c.connect();
    const db=c.db(dbName);
    const cols=['icompany','basegeomars','ycompany'];

    for(const col of cols){
      try{
        // Buscar qualquer documento que tenha um campo com "Entrada" ou "Distrito" no nome
        const docs = await db.collection(col).find({}).limit(1).toArray();
        if(docs && docs.length > 0){
          const doc = docs[0];
          const allKeys = Object.keys(doc);
          const entrada = allKeys.filter(k => k.toLowerCase().includes('entrada') || k.toLowerCase().includes('distrito'));
          console.log('\n=== COLECAO:', col, '===');
          console.log('Total de campos:', allKeys.length);
          console.log('Campos com "entrada" ou "distrito":', entrada);
          if(entrada.length > 0){
            entrada.forEach(field => {
              console.log(`  ${field}: ${doc[field]} (tipo: ${typeof doc[field]})`);
            });
          }
        }
      }catch(e){
        console.error('ERR',col,e.message);
      }
    }
    
    await c.close();
  } catch(e) {
    console.error('Erro geral:', e.message);
    process.exit(1);
  }
})();
