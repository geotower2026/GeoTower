# 🗄️ Como Configurar MongoDB no Render (Resolver Problema de Dados Desaparecendo)

## ⚠️ O Problema

Quando você reinicia o serviço no Render, **todos os seus dados desaparecem**. Isso ocorre porque o sistema está usando **MockDB** (banco de dados em memória), que é apenas para desenvolvimento.

> **MockDB** = dados armazenados na RAM do servidor, não são salvos em disco

Quando o Render reinicia o container, a RAM é apagada e todos os dados se perdem.

---

## ✅ A Solução: Usar MongoDB Atlas

MongoDB Atlas é um banco de dados gratuito na nuvem que vai **persistir seus dados permanentemente**.

### Passo 1:  Criar Conta MongoDB Atlas (Gratuito)

1. Acesse [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Clique em **Sign Up** (ou faça login se já tiver conta)
3. Preencha com seu email e senha
4. Confirme seu email
5. **MongoDB Atlas Dashboard** vai abrir

### Passo 2: Criar um Cluster (Database)

1. No dashboard, clique em **"Create"** (botão verde)
2. Escolha:
   - **Tipo**: AWS (ou Google Cloud / Azure, qualquer um funciona)
   - **Região**: Escolha a mais próxima de você (ex: São Paulo, us-east-1, etc)
   - **Tier**: **M0 (FREE)** - é gratuito!
3. Clique em **"Create Cluster"**
4. Aguarde 2-3 minutos enquanto o cluster é criado

### Passo 3: Criar Usuário (Username e Password)

1. Após o cluster ser criado, clique em **"Database Access"** (à esquerda)
2. Clique em **"Add New Database User"**
3. Escolha **"Autogenerate secure password"** (recomendado)
4. Anote o **username** e **password** que foram gerados
5. Clique em **"Add User"**

**IMPORTANTE**: Salve com segurança essas credenciais!

### Passo 4: Permitir Conexão de Qualquer IP

1. Clique em **"Network Access"** (à esquerda)
2. Clique em **"Add IP Address"**
3. Clique em **"Allow Access from Anywhere"**
4. Clique em **"Confirm"**

> Nota: Para produção real, você só permitiria o IP do Render, mas como você pode não saber qual é, "Anywhere" é mais prático.

### Passo 5: Obter String de Conexão

1. Clique em **"Clusters"** (à esquerda)
2. Clique em **"Connect"** (botão ao lado do seu cluster)
3. Escolha **"Drivers"**
4. Copie a string de conexão que aparece:

```
MONGODB_URI_REMOVED
```

Vai parecer assim:
```
MONGODB_URI_REMOVED
```

**GUARDE ESSA STRING!**

---

## 🚀 Configurar no Render

### Opção 1: Via Painel Web do Render (Recomendado)

1. Acesse [https://render.com/dashboard](https://render.com/dashboard)
2. Clique no seu serviço (backend/API)
3. Vá em **Settings** → **Environment**
4. Procure a variável **`MONGODB_URI`** (se não existir, clique em **"Add Environment Variable"**)
5. Cole a string de conexão do MongoDB Atlas que você copiou
6. Clique em **Save Changes**
7. Seu serviço vai auto-redeploy em ~2 minutos

### Opção 2: Via Arquivo `.env` (Desenvolvimento Local)

Se quiser testar localmente:

1. Edite o arquivo `.env` na raiz do projeto:
```env
MONGODB_URI=MONGODB_URI_REMOVED
```

2. Reinicie o servidor local:
```bash
npm start
```

---

## ✅ Verificar se Está Funcionando

### 1. Verificar Logs do Render

1. Vá em sua app no Render
2. Clique em **Logs**
3. Procure por uma mensagem assim:

```
╔════════════════════════════════════════════════════════════════╗
║                   🗄️  CONFIGURAÇÃO DE BANCO                    ║
╠════════════════════════════════════════════════════════════════╣
║  Modo: MongoDB                                                 ║
╚════════════════════════════════════════════════════════════════╝
```

Se vir "MongoDB" em vez de "MockDB (Em Memória)", está funcionando! ✅

### 2. Testar Upload e Restart

1. Faça um upload de um documento no seu app
2. Vá em Render → seu serviço → **Settings** → **Deploy** → clique em **Deploy** (para forçar reinicialização)
3. Após o restart, volte ao app e verifique se o documento ainda está lá
4. Se estiver, dados estão sendo persistidos! 🎉

---

## 🔒 Segurança

- **Nunca compartilhe** sua string `MONGODB_URI` publicamente
- **Nunca commite** no Git arquivo `.env` com credenciais reais
- No Render, a variável está protegida e criptografada

---

## ❓ Troubleshooting

### "Erro de conexão com MongoDB"
- Verifique se você permitiu "Allow from Anywhere" no Network Access
- Verifique se copiou a string corretamente (especialmente password)
- Aguarde 5 minutos após criar o cluster (pode levar um pouco)

### "Dados continuam desaparecendo"
- Verifique os logs: está aparecendo "MongoDB" ou "MockDB"?
- Se aparecer "MockDB", a variável `MONGODB_URI` não foi configurada corretamente
- Tire uma screenshot do log e nos mostre

### "Não conseguo acessar MongoDB Atlas"
- Verifique seu email, pode ter um link de confirmação pendente
- Tente fazer login novamente em [atlas.mongodb.com](https://atlas.mongodb.com)

---

## 📚 Próximos Passos

Após configurar MongoDB:

✅ Dados persistem após reinicializações
✅ Uploads funcionam  
✅ Downloads funcionam  
✅ ZIP download funciona  

Tudo deve estar rodando perfeitamente!

---

**Precisa de ajuda?** Me mostre:
1. A mensagem de erro (screenshot ou copiado do log)
2. Qual passo está travando
3. Se conseguiu criar a conta MongoDB Atlas
