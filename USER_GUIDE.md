# 📱 Guia de Uso - Delivery Documentation App

## 🚗 Para Motoristas

### 1. Login/Cadastro

**Primeira vez:**
1. Acessar http://localhost:3000
2. Clicar em "Criar novo motorista"
3. Preencher:
   - Nome completo
   - Usuário (sem espaços)
   - Email
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
4. Clicar "Cadastrar"
5. Pronto! Você está logado

**Próximas vezes:**
1. Acessar http://localhost:3000/login
2. Usar usuário e senha

### 2. Home (Tela Inicial)

Três botões grandes:

**📤 Nova Entrega**
- Criar novo registro de entrega
- Preencher informações básicas
- Anexar documentos
- Enviar

**📋 Minhas Entregas**
- Ver todas as entregas (rascunho e enviadas)
- Editar entregas em rascunho
- Filtrar por status
- Buscar por número

**📊 Painel Admin** (se for admin)
- Visualizar todas as entregas
- Ver estatísticas
- Download de documentos

### 3. Nova Entrega (Passo a Passo)

**Passo 1: Informações Básicas**
```
Data: automática (hoje)
Motorista: seu nome (automático)
Nº da Entrega *: (OBRIGATÓRIO)
  └─ Exemplo: PED-12345, 001, etc

Placa do Veículo: (opcional)
  └─ Exemplo: ABC-1234 ou ABC1234

Observações: (opcional)
  └─ Cualquer informação adicional
```

Clique "Continuar para Documentos"

**Passo 2: Anexar Documentos**

Você precisa anexar 5 documentos obrigatórios:

1. **📄 Canhoto NF** - Canhoto da Nota Fiscal
2. **📦 Canhoto CTE** - Canhoto do Conhecimento de Transporte
3. **📓 Diário de Bordo** - Registro do dia
4. **🚛 Devolução Vazio** - Comprovante de devolução vazia
5. **🚚 Retirada Cheio** - Comprovante de retirada cheio

**Como anexar:**
- Clique no botão "Selecionar foto"
- Escolha tirar foto (câmera) ou da galeria
- Foto será comprimida automaticamente
- Quando anexado, mostra "✅ Anexado"

**Dicas importantes:**
- ✓ Fotografe documentos bem iluminados
- ✓ Certifique que texto está legível
- ✓ Não tire de ângulo (frontal)
- ✓ Documentos serão comprimidos para não ficar pesados

**Passo 3: Enviar**

1. Todos os 5 documentos devem estar anexados
2. Clique "Finalizar e Enviar"
3. Espere mensagem "✅ Enviado com sucesso!"
4. Você será redirecionado para "Minhas Entregas"
5. **Atenção:** Após envio, não pode editar

### 4. Minhas Entregas

**Visualizar:**
- Número da entrega
- Data
- Status (📝 Rascunho ou ✅ Enviada)
- Quantos documentos anexados

**Ações:**
- 👁️ **Ver/Editar**: Abrir entrega (só rascunho pode editar)
- 🗑️ **Deletar**: Remover (apenas rascunhos)

**Filtros:**
- Todas
- Rascunho
- Enviadas

### 5. Perfil

Clique no menu (☰) no canto superior direito para:
- Ver seu nome
- Sair da conta

---

## 👨‍💼 Para Admin

### 1. Dashboard

**Cards de Estatísticas:**
- Total de Entregas (período selecionado)
- Motoristas Ativos

**Gráficos:**
- 📈 Entregas por Dia (últimos 30 dias)
- 📊 Entregas por Motorista

### 2. Filtros e Busca

**Período:** Hoje | Esta Semana | Este Mês

**Busca:**
- Número da entrega
- Nome do motorista

**Datas:**
- De: data inicial
- Até: data final

### 3. Tabela de Entregas

Mostra:
- Nº Entrega
- Motorista
- Data de Envio
- Status
- Botão Ver

**Ver Detalhes:**

Clique "Ver" para abrir modal com:

**Informações:**
- Motorista
- Data de Envio
- Placa (se preenchida)

**Documentos:** (5 documentos)
Cada um com botão "Download"

**Observações:** (se preenchidas)

---

## 🔧 Funcionalidades Técnicas

### Upload de Imagens
✓ Aceita JPEG, PNG, GIF, WebP
✓ Máximo 10MB
✓ Comprimido automaticamente para ~80% qualidade
✓ Suporta câmera do telefone

### Compressão
- Reduz tamanho em ~60-70%
- Mantém qualidade adequada para leitura
- Automática (sem configuração)

### Recuperação de Erros
- Se conexão cair, fotos são salvas localmente
- Tente novamente quando reconectar
- Mensagens de erro claras

### Responsividade
✓ Funciona em iPhone, iPad, Android, Desktop
✓ Botões grandes para toque fácil
✓ Otimizado para telas pequenas

---

## ⚠️ Regras Importantes

1. **Login é necessário**
   - Cada motorista tem sua conta
   - Dados separados por motorista

2. **5 documentos são obrigatórios**
   - Não pode enviar com menos de 5
   - Sistema valida automaticamente

3. **Após envio, não pode editar**
   - Entrega fica somente leitura
   - Para correções, admin faz manualmente

4. **Dados automáticos**
   - Data sempre é do dia
   - Motorista é o logado
   - Não podem ser alterados

5. **Números únicos**
   - Dois motoristas podem ter mesmo Nº entrega?
   - Sim, cada um tem sua cópia

---

## 📱 Dicas de Uso Mobile

1. **Câmera:**
   - Use luz natural
   - Mantenha documento firme
   - Tire foto frontal

2. **Conexão lenta:**
   - App funciona mesmo com 3G/4G fraco
   - Compressão automática ajuda
   - Se desconectar, tente novamente

3. **Baterias/Storage:**
   - Imagens são comprimidas (pouco espaço)
   - App não usa muita bateria

4. **Teclado:**
   - Fonte grande para não errar dados
   - Número automático de entrega é copiado se precisar

---

## 🐛 Problemas Comuns

**"Senha ou usuário errado"**
- Verificar CAPS LOCK
- Usuário não é email
- Verificar espaços

**"Documento não anexa"**
- Verificar conexão internet
- Tentar outra imagem
- Arquivo pode ser muito grande

**"Não consegue enviar"**
- Verificar se todos 5 documentos estão
- Verificar conexão
- Tente novamente (auto-retry)

**"Foto muito grande"**
- App comprime automaticamente
- Se muito grande, tira foto menor
- Se der erro, tente em JPEG

**"Não vejo entrega enviada"**
- Recarregar página (F5)
- Ir para "Minhas Entregas"
- Se muito recente, esperar 1 segundo

---

## 🔐 Segurança

✓ Senha criptografada
✓ Token seguro (7 dias)
✓ Logout automático se expirar
✓ Dados salvos em servidor seguro
✓ Admin não vê senhas

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verificar seção "Problemas Comuns" acima
2. Verificar conexão internet
3. Recarregar página (F5)
4. Fazer logout e login novamente
5. Contactar administrador

---

**Aproveite o sistema!** 📦✨
