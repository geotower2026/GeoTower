# Frontend - React + Tailwind

## 📱 O que é?

Interface responsiva para motoristas e admin:
- 🚗 Login de motoristas
- 📋 Criação de entregas
- 📸 Upload de documentos
- 📊 Painel administrativo
- 📈 Gráficos de estatísticas

## 🚀 Setup Rápido

```bash
cd frontend
npm install
npm start
```

Acesse: `http://localhost:3000`

## 📁 Estrutura

```
frontend/
├── public/
│   └── index.html         # HTML principal
├── src/
│   ├── App.js             # Roteamento
│   ├── index.js           # Entrada
│   ├── index.css          # Estilos globais
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/             # Telas principales
│   └── services/          # API, contexto
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Componentes

| Componente | Propósito |
|-----------|-----------|
| Header | Cabeçalho com navegação |
| DocumentUpload | Upload de documentos |
| PrivateRoute | Proteção de rotas |
| Toast | Notificações |

## 📄 Páginas

| Página | Descrição |
|--------|-----------|
| Login | Autenticação |
| Register | Cadastro novo motorista |
| Home | Tela inicial com botões |
| NovaEntrega | Criar/editar entrega |
| MinhasEntregas | Histórico entregas |
| AdminDashboard | Painel administrativo |

## 🔑 Variáveis de Ambiente

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎨 Tailwind CSS

Estilo completo com Tailwind. Sem CSS customizado necessário.

## 📦 Dependências

- **react** - Framework UI
- **react-router-dom** - Roteamento
- **axios** - Requisições HTTP
- **recharts** - Gráficos
- **react-icons** - Ícones
- **tailwindcss** - Styling

## ✨ Features

✅ Login/Cadastro
✅ Criar entregas
✅ Upload 5 documentos
✅ Validação completa
✅ Dashboard admin
✅ Gráficos em tempo real
✅ Responsivo (mobile/desktop)
✅ Toast notifications
✅ Private routes
✅ Auto-logout

## 📱 Responsividade

- ✅ iPhone 5+
- ✅ Android
- ✅ iPad
- ✅ Desktop
- ✅ Tablets

## 🚀 Build para Produção

```bash
npm run build
```

Pasta `build/` pronta para deploy.

## 🆘 Troubleshooting

**Frontend não conecta ao backend:**
```
Verificar:
1. Backend rodando em http://localhost:5000
2. REACT_APP_API_URL em .env correto (para deploy em Render, garanta que a variável de ambiente do serviço frontend aponte para o domínio do backend). 
3. CORS habilitado no backend
```

**Erro ao fazer login:**
```
Verificar:
1. Backend rodando
2. MongoDB acessível
3. Usuário e senha corretos
```

---

Para mais informações, veja documentação na raiz do projeto.
