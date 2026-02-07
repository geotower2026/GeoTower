# 🚀 Guia de Setup - Delivery Documentation App

## Pré-requisitos

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) ou usar [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Git** (opcional)

## 1️⃣ Instalação do MongoDB (Local)

### Windows
1. Baixar MongoDB Community Edition
2. Executar o instalador
3. MongoDB será instalado como serviço e iniciado automaticamente

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu)
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Ou usar MongoDB Atlas (Cloud):**
1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Copiar connection string

## 2️⃣ Setup do Backend

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env na raiz do projeto (fora de backend)
# Copiar conteúdo de ../.env.example
```

### Configurar .env

No arquivo `/App/.env`:
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/delivery-docs
JWT_SECRET=sua_chave_secreta_bem_forte_aqui_2024
PORT=5000
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Iniciar Backend

```bash
npm run dev
```

✓ Backend rodando em http://localhost:5000

## 3️⃣ Setup do Frontend

```bash
# Em outro terminal, entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
```

### Iniciar Frontend

```bash
npm start
```

✓ Frontend rodando em http://localhost:3000

## 4️⃣ Primeiro Acesso

1. Abrir http://localhost:3000
2. Clicar em "Criar novo motorista"
3. Preencher dados:
   - Nome: Seu Nome
   - Usuário: seu.usuario
   - Email: seu@email.com
   - Senha: minimo 6 caracteres
4. Pronto! Você está logado como motorista

### Criar Admin

Para criar um admin, você precisa acessar o MongoDB e atualizar um usuário:

```bash
# Conectar ao MongoDB
mongosh

# No terminal MongoDB
use delivery-docs
db.drivers.updateOne(
  { username: "seu.usuario" },
  { $set: { role: "admin" } }
)
```

Agora você terá acesso ao painel admin em "Painel Admin".

## 5️⃣ Estrutura de Pastas

```
App/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica das rotas
│   │   ├── models/           # Schemas do MongoDB
│   │   ├── routes/           # Definição de rotas
│   │   ├── middleware/       # Auth, admin, etc
│   │   ├── utils/            # Utilitários (upload, compressão)
│   │   └── server.js         # Entrada do servidor
│   ├── uploads/              # Pasta de arquivos
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas
│   │   ├── services/         # API, contexto, etc
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 6️⃣ Comandos Úteis

### Desenvolvimento (ambos os servidores)
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Iniciar em Produção
```bash
npm run start
```

### Backend apenas
```bash
cd backend && npm run dev
```

### Frontend apenas
```bash
cd frontend && npm start
```

## 7️⃣ Troubleshooting

### Erro: "MongoDB connection refused"
- Verificar se MongoDB está rodando
- Windows: Services > MongoDB Server deve estar ativo
- Linux: `sudo systemctl start mongod`
- Cloud: Verificar connection string

### Erro: "EADDRINUSE: port 5000 already in use"
```bash
# Kill process na porta 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Frontend não conecta ao backend
- Verificar se backend está rodando em http://localhost:5000
- Verificar REACT_APP_API_URL em .env
- Verificar CORS no backend (já está configurado)

## 8️⃣ Features

✅ Login/Registro de motoristas
✅ Criação de entregas com informações obrigatórias
✅ Captura/upload de 5 documentos obrigatórios
✅ Compressão automática de imagens
✅ Bloqueio de edição após envio
✅ Painel admin com filtros e busca
✅ Gráficos de estatísticas
✅ Download de documentos
✅ Interface responsiva (mobile e desktop)
✅ Tratamento robusto de erros
✅ Recuperação em caso de falha de conexão

## 9️⃣ Próximos Passos

1. **Customização**: Adicionar logo e cores da sua marca
2. **Segurança**: Usar chave JWT forte em produção
3. **Deploy**: Fazer deploy em serviços como Heroku, AWS, DigitalOcean
4. **Banco**: Usar MongoDB Atlas em produção
5. **Storage**: Considerar S3, Google Cloud Storage ou similar para fotos

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação: [README.md](../README.md)
- API Docs: [API_DOCS.md](./API_DOCS.md)
- Issues: Criar issue no repositório

---

**Pronto para usar!** 🎉
