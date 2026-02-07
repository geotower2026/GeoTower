# 🔧 Troubleshooting - Solução de Problemas

## 🚨 Erros Comuns e Soluções

### 1. "MongoDB connection refused"

**Problema:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Soluções:**

**A) MongoDB não está rodando**
```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux (Ubuntu)
sudo systemctl start mongod

# Windows (Services)
Services → MongoDB Server → Start

# Docker
docker run -d -p 27017:27017 mongo
```

**B) Usando MongoDB Atlas (cloud)**
```
1. Ir a https://www.mongodb.com/cloud/atlas
2. Criar cluster gratuito
3. Copiar connection string
4. Colar em .env como MONGODB_URI
```

**C) Porta 27017 está bloqueada**
```bash
lsof -i :27017              # Encontrar PID
kill -9 PID                 # Matar processo
```

---

### 2. "Port 5000 already in use"

**Problema:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Soluções:**

**A) Matar processo na porta**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou trocar porta em .env
PORT=5001
```

**B) Outro servidor ainda rodando?**
```bash
# Fechar terminal anterior
# Ou rodar em porta diferente
PORT=5001 npm run dev:backend
```

---

### 3. "Cannot find module"

**Problema:**
```
Error: Cannot find module 'express'
```

**Soluções:**

```bash
# Instalar novamente
npm install

# Limpar cache
npm cache clean --force

# Reinstalar tudo
rm -rf node_modules package-lock.json
npm install

# Verificar Node version (deve ser 14+)
node -v
```

---

### 4. "Frontend não conecta ao Backend"

**Problema:**
```
Error: Network request failed
API call: http://localhost:5000/api/auth/login
```

**Soluções:**

**A) Backend não está rodando**
```bash
# Terminal 1
cd backend && npm run dev
# Deve mostrar: ✓ Servidor rodando na porta 5000
```

**B) REACT_APP_API_URL incorreto**
```bash
# Editar .env
REACT_APP_API_URL=http://localhost:5000/api

# Reiniciar frontend
npm start
```

**C) CORS bloqueado**
```bash
# Verificar backend/src/server.js
# Deve ter: app.use(cors());

# Se não tiver, adicionar:
const cors = require('cors');
app.use(cors());
```

**D) Firewall bloqueando**
```bash
# Permitir Node em Firewall
# Windows: Settings → Firewall → Allow app through firewall → Node.js
```

---

### 5. "Erro ao fazer Login"

**Problema:**
```
Response: { success: false, message: "Credenciais inválidas" }
```

**Soluções:**

1. ✅ Usuário e senha corretos?
2. ✅ Senha tem mínimo 6 caracteres?
3. ✅ MongoDB rodando?
4. ✅ Motorista foi registrado?
5. ✅ Usuário está ativo (isActive: true)?

```bash
# Verificar no MongoDB
mongosh
use delivery-docs
db.drivers.findOne({ username: "seu.usuario" })
```

---

### 6. "Image upload não funciona"

**Problema:**
```
Error: File type not supported
```

**Soluções:**

1. ✅ Formato correto? (JPEG, PNG, GIF, WebP)
2. ✅ Arquivo < 10MB?
3. ✅ Pasta uploads/ existe?
4. ✅ Permissão de escrita na pasta?

```bash
# Verificar pasta
ls -la backend/uploads/

# Criar se não existir
mkdir -p backend/uploads

# Permissão
chmod 755 backend/uploads/
```

---

### 7. "Build falha"

**Problema:**
```
Build failed with errors
```

**Soluções:**

```bash
# Limpar
rm -rf build/
rm -rf node_modules/

# Reinstalar
npm install

# Build novamente
npm run build

# Se erro de memória
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

### 8. "Jest/Testing errors" (se usar testes)

**Problema:**
```
Error: ENOENT: no such file or directory
```

**Soluções:**

```bash
# Instalar dependências de teste
npm install --save-dev jest

# Rodar testes
npm test

# Teste único arquivo
npm test -- arquivo.test.js
```

---

### 9. "Heroku deploy falha"

**Problema:**
```
Procfile not found or build error
```

**Soluções:**

```bash
# Criar Procfile
echo "web: npm start" > Procfile

# Verificar variáveis
heroku config
heroku config:set MONGODB_URI=sua_uri

# Logs
heroku logs --tail

# Deploy novamente
git push heroku main
```

---

### 10. "Admin não consegue acessar painel"

**Problema:**
```
Página em branco ou redirecionada
```

**Soluções:**

```bash
# Verificar se é admin
mongosh
use delivery-docs
db.drivers.findOne({ username: "seu.usuario" })

# Se role não é "admin", atualizar
db.drivers.updateOne(
  { username: "seu.usuario" },
  { $set: { role: "admin" } }
)

# Logout e login novamente
```

---

## 🔍 Diagnóstico

### Checklist de Debug

```bash
# 1. Node.js instalado?
node -v

# 2. npm instalado?
npm -v

# 3. MongoDB rodando?
mongosh

# 4. Portas livres?
lsof -i :3000 :5000 :27017

# 5. Dependências instaladas?
ls -la node_modules | head

# 6. .env existe?
ls -la .env

# 7. Backend pode iniciar?
cd backend && npm run dev

# 8. Frontend pode iniciar?
cd frontend && npm start

# 9. Consegue fazer login?
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# 10. MongoDB tem dados?
mongosh
use delivery-docs
db.drivers.countDocuments()
```

---

## 📋 Passos de Debug

### Se Frontend mostra erro:

1. **Abrir DevTools** (F12)
2. **Ir para Console**
3. **Ler mensagem de erro**
4. **Verificar Network** para ver requisição
5. **Verificar Backend logs**
6. **Recarregar página** (Ctrl+Shift+R)
7. **Limpar localStorage** (se auth problem)

### Se Backend mostra erro:

1. **Verificar terminal**
2. **Ler stack trace**
3. **Procurar linha de erro**
4. **Revisar código naquela linha**
5. **Verificar variáveis de ambiente**
6. **Checkar logs**
7. **Reiniciar servidor**

### Se Banco de dados tem problema:

1. **Conectar ao MongoDB** (mongosh)
2. **Verificar se database existe** (show dbs)
3. **Verificar se coleções existem** (show collections)
4. **Ver dados** (db.drivers.find())
5. **Verificar índices** (db.drivers.getIndexes())
6. **Validar esquema** (comparar com código)

---

## 🚨 Erros de Validação

### Erro no Upload

```javascript
// Problema: arquivo muito grande
// Solução: Reduzir arquivo ou aumentar limite

// Problema: tipo de arquivo não permitido
// Solução: Usar JPEG, PNG, GIF ou WebP

// Problema: pasta uploads não existe
// Solução: mkdir backend/uploads
```

### Erro de Autenticação

```javascript
// Problema: token expirado
// Solução: Fazer login novamente

// Problema: token inválido
// Solução: Verificar JWT_SECRET em .env

// Problema: senha incorreta
// Solução: Verificar se está com caps lock
```

---

## 💾 Recovery (Recuperação)

### Se dados foram perdidos

```bash
# Backup automático (MongoDB Atlas)
# Ir a https://www.mongodb.com/cloud/atlas
# Snapshots → Restore

# Backup local
mongodump -d delivery-docs -o backup/
mongorestore backup/
```

### Se arquivo foi deletado

```bash
# Recuperar de Git
git checkout arquivo.js

# Se não tiver no Git
# Copiar de backup ou refazer
```

---

## 🆘 Quando Tudo Falha

```bash
# Nuclear option: Limpar tudo

# 1. Parar servidores (Ctrl+C)

# 2. Deletar node_modules
rm -rf backend/node_modules frontend/node_modules node_modules

# 3. Deletar package-lock
rm -f backend/package-lock.json frontend/package-lock.json package-lock.json

# 4. Reinstalar
npm run setup

# 5. Resetar MongoDB
mongosh
use delivery-docs
db.dropDatabase()

# 6. Iniciar novamente
npm run dev
```

---

## 📞 Pedindo Ajuda

Ao descrever problema, incluir:

1. **Sistema operacional** (Windows, macOS, Linux)
2. **Versão Node** (node -v)
3. **Mensagem de erro completa**
4. **Passos para reproduzir**
5. **Arquivo .env (sem senhas)**
6. **Logs do terminal**
7. **Último comando executado**

Exemplo:
```
Sistema: Windows 10
Node: v18.15.0
Erro: "MongoDB connection refused"
Terminal: npm run dev:backend
.env: MONGODB_URI=mongodb://localhost:27017/delivery-docs
Logs: Error: connect ECONNREFUSED 127.0.0.1:27017
```

---

**Problema não listado?** Verificar:
- Stack Overflow
- Documentação oficial
- Issues do projeto no GitHub
- Forum da comunidade

---

**Lembre-se:** Reiniciar geralmente resolve a maioria dos problemas! 🔄
