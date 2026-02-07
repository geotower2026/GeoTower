# Backend - API REST

## 📋 O que é?

API Node.js + Express que gerencia:
- ✅ Autenticação de motoristas
- ✅ Criação e envio de entregas
- ✅ Upload e armazenamento de documentos
- ✅ Painel administrativo
- ✅ Estatísticas

## 🚀 Setup Rápido

```bash
cd backend
npm install
npm run dev
```

Servidor rodando em `http://localhost:5000/api`

## 📁 Estrutura

```
backend/
├── src/
│   ├── server.js          # Entrada principal
│   ├── models/            # Esquemas MongoDB
│   ├── controllers/       # Lógica das rotas
│   ├── routes/            # Definição de endpoints
│   ├── middleware/        # Auth, validação
│   └── utils/             # Upload, compressão
├── uploads/               # Imagens armazenadas
├── package.json
└── API_DOCS.md           # Documentação de endpoints
```

## 🔑 Variáveis de Ambiente

```env
MONGODB_URI=mongodb://localhost:27017/delivery-docs
JWT_SECRET=sua_chave_secreta
PORT=5000
NODE_ENV=development
```

## 📡 Endpoints Principais

**Sem autenticação:**
- `POST /api/auth/register` - Novo motorista
- `POST /api/auth/login` - Login

**Com autenticação:**
- `GET /api/deliveries` - Minhas entregas
- `POST /api/deliveries` - Nova entrega
- `POST /api/deliveries/:id/documents/:type` - Upload documento
- `POST /api/deliveries/:id/submit` - Enviar entrega

**Admin (autenticado + role admin):**
- `GET /api/admin/deliveries` - Todas entregas
- `GET /api/admin/statistics` - Estatísticas
- `GET /api/admin/deliveries/:id/documents/:type/download` - Download

## 🛠️ Tecnologias

- **Express** - Framework web
- **Mongoose** - ODM MongoDB
- **JWT** - Autenticação
- **Bcrypt** - Criptografia senhas
- **Multer** - Upload de arquivos
- **Sharp** - Compressão imagens
- **Helmet** - Segurança HTTP
- **CORS** - Requisições cross-origin

## 🔐 Segurança

- ✅ Senhas criptografadas (bcrypt)
- ✅ JWT tokens (7 dias)
- ✅ CORS habilitado
- ✅ Validação em todas rotas
- ✅ Middleware de autenticação
- ✅ Admin-only routes

## 📦 Documentação Completa

Veja [API_DOCS.md](./API_DOCS.md) para lista de todos endpoints com exemplos.

## 🆘 Troubleshooting

**MongoDB não conecta:**
```bash
# Windows
net start MongoDB

# Linux/Mac
mongod
```

**Port 5000 em uso:**
```bash
# Encontrar e matar processo
lsof -ti:5000 | xargs kill -9
```

---

Para mais informações, veja documentação na raiz do projeto.
