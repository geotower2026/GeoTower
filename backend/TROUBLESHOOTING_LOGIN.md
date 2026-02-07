# 🔐 Troubleshooting - Erro 500 no Login (Render/Cloudflare)

## Problema Identificado ✅

O servidor está retornando **erro 500** quando você tenta fazer login no endereço de produção (`geotransportesenregas.onrender.com`), mas funciona normalmente em localhost.

### Causas Mais Comuns:

1. **MockDB não persiste entre deploys** - A base de dados em memória é perdida quando o servidor reinicia
2. **Sincronização de arquivos** - Os dados locais não estão sincronizados com o servidor de produção
3. **Variáveis de ambiente** - MONGODB_URI não configurada no Render
4. **Senha incorreta** - O usuário foi criado com uma senha diferente

---

## ✅ Solução: Reset de Senha

### Passo 1: Reset local (já concluído)

A senha de `josinei vieira` foi resetada para:
- **Usuário**: `josinei vieira`
- **Senha**: `senha123`

### Passo 2: Sincronizar com Render

O arquivo de dados foi atualizado em:
- ✅ `/backend/data/db.json` (backup)
- ✅ `/backend/data/manaus/db.json` (arquivo ativo)
- ✅ `/backend/data/itajai/db.json` (conforme necessário)

### Passo 3: Deploy para Render

Para sincronizar os dados com Render:

```bash
# Via Git
git add backend/data/
git commit -m "Fix: Sincronizar dados do banco com senha resetada"
git push heroku main  # ou sua branch configurada

# Via Render Dashboard
# 1. Vá para https://dashboard.render.com
# 2. Selecione seu serviço
# 3. Clique em "Manual Deploy" ou aguarde auto-deploy do Git
```

---

## 🛠️ Como Usar o Script de Reset

Para resetar a senha de qualquer usuário:

```bash
cd backend

# Resetar password de um usuário (atualiza todos os arquivos)
node reset-password.js "nome_usuario" "nova_senha"

# Exemplos:
node reset-password.js "josinei vieira" "minha_nova_senha"
node reset-password.js "admin" "admin123"
node reset-password.js "transportes" "abc123"

# Atualizar apenas uma cidade específica
node reset-password.js "josinei vieira" "nova_senha" manaus
node reset-password.js "josinei vieira" "nova_senha" itajai
```

### Listar usuários disponíveis:

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/manaus/db.json', 'utf8'));
console.log('Usuários cadastrados:');
data.drivers.forEach(d => console.log(\`  - \${d.username} (\${d.role})\`));
"
```

---

## 🚀 Prevenção: Configurar MongoDB no Render

Se quiser eliminar completamente dependência do MockDB:

### 1. Criar cluster MongoDB Atlas:
- Vá para: https://www.mongodb.com/cloud/atlas
- Crie uma conta gratuita
- Crie um cluster (M0 é gratuito)
- Copie a connection string

### 2. Configurar no Render:

```bash
# No seu serviço Render:
# Environment → Add Environment Variable

Name: MONGODB_URI
Value: MONGODB_URI_REMOVED
```

### 3. Deploy:
- Salve a variável
- Clique em "Deploy" (será feito auto-deploy)

---

## 🔍 Debug: Verificar Logs no Render

1. Vá para: https://dashboard.render.com
2. Selecione seu serviço
3. Clique em "Logs"
4. Procure por linha contendo:
   - `🔐 LOGIN ATTEMPT` - tentativa de login
   - `❌ Password mismatch` - senha incorreta
   - `👤 Driver found` - usuário existe
   - `✅ Login success` - login bem-sucedido
   - `[DB-FALLBACK]` - status do banco de dados

### Exemplo de Output Esperado:

```
[DB-FALLBACK] MONGODB_URI não configurado, usando MockDB para cidade: manaus
🔐 LOGIN ATTEMPT: { username: 'josinei vieira', passwordLength: 8 }
👤 Driver found: josinei vieira
🔑 Password check: { provided: '55a5e9e7...', stored: '55a5e9e7...', match: true }
✅ Login success: josinei vieira
```

---

## ⚠️ Se Continuar com Erro 500

1. **Verificar conexão MongoDB** (se configurado):
   - Testar URI em: https://www.mongodb.com/products/compass
   
2. **Verificar variáveis de ambiente**:
   ```bash
   # No terminal Render, execute:
   printenv | grep MONGO
   printenv | grep DATABASE
   ```

3. **Forçar rebuild**:
   - Dashboard → Manual Deploy ou re-push para Git

4. **Verificar espaço em disco**:
   - Se `/backend/data` estiver muito grande, considere usar MongoDB

---

## 📝 Checklist Rápido

- [ ] Senha resetada localmente ✅
- [ ] Arquivos de dados atualizados ✅
- [ ] Deploy feito para Render (ou aguardando)
- [ ] Testar login em: https://geotransportesenregas.onrender.com
- [ ] Se falhar, verificar logs no Render Dashboard
- [ ] Considerar configurar MongoDB para produção

---

## 💡 Melhores Práticas para o Futuro

1. **Use MongoDB em produção** (deixe MockDB só para desenvolvimento)
2. **Backup automático** dos dados antes de limpar
3. **Monitore logs** regularmente para erros
4. **Sincronize senhas** entre ambientes local e remoto
5. **Use variáveis de ambiente** para configurações sensíveis

---

## Contato / Suporte

Se o erro persistir:
1. Verifique se fez push do código atualizado
2. Aguarde 2-3 minutos após o deploy (Render precisa reiniciar)
3. Limpe cache do navegador (Ctrl+Shift+Del)
4. Tente em uma aba anônima/privada
5. Verifique a aba Network no DevTools para ver resposta exata do servidor
