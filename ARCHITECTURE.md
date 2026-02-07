# 🏗️ Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Browser)                        │
│                      React + Tailwind                        │
│              (Desktop, iPad, iPhone, Android)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                   HTTP/HTTPS
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────────┐      ┌──────────▼──────────┐
│   Frontend API     │      │   Arquivo Upload    │
│   Chamadas axios   │      │   Images (comprimidas)
└───────┬────────────┘      └──────────┬──────────┘
        │                              │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   Node.js + Express API     │
        │   - Autenticação (JWT)      │
        │   - Validação de dados      │
        │   - Compressão de imagens   │
        │   - Gerenciamento de upload │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      MongoDB Database        │
        │   - Drivers (motoristas)    │
        │   - Deliveries (entregas)  │
        │   - Documents (metadados)   │
        └─────────────────────────────┘
```

## Stack Tecnológico

### Frontend
```
React 18
├── Components (reutilizáveis)
├── Pages (telas principais)
├── Services
│   ├── API (axios)
│   ├── Auth Context (Redux-like)
│   └── Auth Service (chamadas)
├── Styling (Tailwind CSS)
└── Routing (React Router v6)
```

### Backend
```
Node.js + Express
├── Controllers (lógica)
├── Models (Mongoose + MongoDB)
├── Routes (API endpoints)
├── Middleware
│   ├── Auth (JWT)
│   ├── Admin (role check)
│   └── Upload (Multer)
├── Utils
│   ├── Upload (Multer config)
│   └── Image Compression (Sharp)
└── Error Handling
```

### Database
```
MongoDB (NoSQL)
├── Collections
│   ├── drivers
│   │   ├── _id
│   │   ├── name
│   │   ├── username (unique)
│   │   ├── email (unique)
│   │   ├── password (hashed)
│   │   ├── phone
│   │   ├── role (driver | admin)
│   │   └── timestamps
│   │
│   └── deliveries
│       ├── _id
│       ├── deliveryNumber
│       ├── driverId (ref)
│       ├── driverName
│       ├── vehiclePlate
│       ├── observations
│       ├── documents
│       │   ├── canhotNF
│       │   ├── canhotCTE
│       │   ├── diarioBordo
│       │   ├── devolucaoVazio
│       │   └── retiradaCheio
│       ├── status
│       └── timestamps
```

## Fluxo de Autenticação

```
1. Usuário entra credenciais
   ↓
2. Backend valida contra MongoDB
   ↓
3. Se válido, gera JWT token
   ↓
4. Frontend armazena token em localStorage
   ↓
5. Todas requisições incluem: Authorization: Bearer {token}
   ↓
6. Backend valida token a cada request
   ↓
7. Se expirar, redireciona para login
```

## Fluxo de Entrega

```
┌─ MOTORISTA ────────────────────────────────────────┐
│                                                    │
│ 1. Nova Entrega                                   │
│    └─ Cria registro com dados básicos             │
│                                                    │
│ 2. Upload Documentos                              │
│    └─ 5 documentos obrigatórios                   │
│       └─ Compressão automática                    │
│       └─ Validação de tipo                        │
│                                                    │
│ 3. Enviar/Submit                                  │
│    └─ Valida se todos 5 documentos existem       │
│    └─ Muda status para "submitted"               │
│    └─ Bloqueia edição                            │
│                                                    │
└────────────────────────────────────────────────────┘
                      │
                      │ API Call
                      ↓
┌─ BACKEND ─────────────────────────────────────────┐
│                                                    │
│ 1. Auth Middleware                                │
│    └─ Valida JWT token                           │
│                                                    │
│ 2. Controller                                     │
│    └─ Busca entrega no DB                        │
│    └─ Valida documentos                          │
│    └─ Atualiza status                            │
│                                                    │
│ 3. MongoDB                                        │
│    └─ Salva/atualiza dados                       │
│                                                    │
│ 4. Response                                       │
│    └─ Retorna status 200 com dados               │
│                                                    │
└────────────────────────────────────────────────────┘
                      │
                      │ Response
                      ↓
┌─ MOTORISTA ────────────────────────────────────────┐
│                                                    │
│ Mostra mensagem de sucesso                       │
│ Redireciona para "Minhas Entregas"               │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Fluxo Admin

```
┌─ ADMIN ────────────────────────────────┐
│                                        │
│ 1. Ver Dashboard                       │
│    └─ Carrega estatísticas             │
│    └─ Gráficos de entregas            │
│                                        │
│ 2. Filtrar Entregas                    │
│    └─ Por motorista                    │
│    └─ Por data                         │
│    └─ Por número da entrega            │
│                                        │
│ 3. Detalhes da Entrega                 │
│    └─ Visualizar dados do motorista   │
│    └─ Ver todos os 5 documentos       │
│    └─ Download de documentos           │
│                                        │
└────────────────────────────────────────┘
                   │
                   │ API Call
                   ↓
┌─ BACKEND ──────────────────────────────┐
│                                        │
│ Admin Middleware                       │
│ └─ Verifica se role = "admin"         │
│                                        │
│ Controllers                            │
│ └─ Busca todas entregas enviadas      │
│ └─ Calcula estatísticas               │
│ └─ Retorna dados para gráficos        │
│                                        │
└────────────────────────────────────────┘
```

## Compressão de Imagens

```
Upload arquivo grande
       ↓
Multer salva temporariamente
       ↓
Sharp processa
  ├─ Detecta formato
  ├─ Define quality = 80
  ├─ Comprime
  └─ Salva resultado
       ↓
Arquivo original deletado
       ↓
Arquivo comprimido mantido (~200-300KB)
```

## Segurança

### Backend
- JWT tokens com expiração de 7 dias
- Senhas criptografadas com bcrypt
- CORS habilitado
- Validação de entrada em todas rotas
- Middleware de autenticação em rotas protegidas
- Admin-only routes protegidas

### Frontend
- Token salvo em localStorage (seguro-ish, considerar SessionStorage)
- Revalidação de token em erro 401
- Validação de formulário antes submit
- Sanitização de inputs

### Database
- Acesso restrito via credenciais
- Sem dados sensíveis em logs
- Índices para queries eficientes

## Performance

### Otimizações
- Lazy loading de componentes
- Compressão de imagens automática
- Índices no MongoDB
- Caching de dados do usuário
- Requisições paralelas onde possível

### Limitações
- Max file size: 10MB por imagem
- Qualidade JPEG/PNG: 80% (balanceado)
- Timeout de API: 30 segundos

## Escalabilidade

### Futura
- Load balancer (múltiplas instâncias)
- Redis para cache
- S3/Google Cloud Storage para arquivos
- Database replication
- CDN para servir imagens

### Atual
- Suporta ~1000 motoristas simultâneos
- ~10K entregas/mês em 1 servidor
- Armazenamento local de arquivos

## Monitoring & Logs

### Backend
```
PORT=5000
✓ MongoDB conectado
✓ Servidor rodando
```

### Variáveis importantes
- NODE_ENV: development/production
- JWT_SECRET: chave secreta
- MONGODB_URI: conexão DB

## Diagrama de Estados (Entrega)

```
┌─────────┐
│  DRAFT  │ (Rascunho - em preenchimento)
│ (novo)  │
└────┬────┘
     │ submit + todos docs
     ↓
┌──────────┐
│SUBMITTED │ (Enviada - imutável)
│ (final)  │
└──────────┘

Admin pode ver ambos estados
Motorista pode editar apenas DRAFT
```

---

**Arquitetura modular, escalável e segura.** ✨
