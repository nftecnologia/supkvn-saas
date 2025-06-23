# 🚀 SaaS de Atendimento Inteligente

Um SaaS completo para atendimento ao cliente que integra chat, e-mail e IA para oferecer suporte automatizado e personalizado.

## ✨ Funcionalidades

- **Chat ao Vivo**: Widget embedável para sites dos clientes
- **E-mail**: Integração IMAP/SMTP para gerenciar atendimento por e-mail
- **IA Inteligente**: Agente que responde no chat e e-mail usando base de conhecimento personalizada
- **Dashboard**: Métricas e visão geral do atendimento
- **Base de Conhecimento**: Gerenciamento de conteúdo para IA
- **Configurações Avançadas**: Widget, IA, e-mail e API

## 🛠️ Stack Tecnológica

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Socket.io (WebSocket para chat)
- JWT Authentication
- OpenAI Integration
- Redis (cache)

### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- Zustand (estado global)
- React Query (cache de API)

### Widget
- TypeScript + Vite
- Chat embedável
- Build UMD para qualquer site

## 🚀 Quick Start

### Desenvolvimento Local

1. **Clone o repositório**:
```bash
git clone https://github.com/nftecnologia/supkvn-saas.git
cd supkvn-saas
```

2. **Instale as dependências**:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../widget && npm install
```

3. **Configure as variáveis de ambiente**:
```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# Frontend
cp frontend/.env.example frontend/.env
# Edite frontend/.env com suas configurações
```

4. **Configure o banco de dados** (desenvolvimento com SQLite):
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. **Inicie os servidores**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Widget (opcional)
cd widget && npm run dev
```

6. **Acesse a aplicação**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Widget: http://localhost:5174

## 🌐 Deploy em Produção

### Backend (Railway)

1. **Configure o Railway**:
```bash
npm install -g @railway/cli
railway login
railway init
```

2. **Configure as variáveis de ambiente no Railway**:
- `NODE_ENV=production`
- `JWT_SECRET=seu_jwt_secret_super_seguro`
- `OPENAI_API_KEY=sua_chave_openai`
- `FRONTEND_URL=https://seu-frontend.vercel.app`

3. **Deploy**:
```bash
railway up
```

### Frontend (Vercel)

1. **Conecte o repositório no Vercel**
2. **Configure Build Settings**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
3. **Configure variáveis de ambiente**:
   - `VITE_API_URL=https://seu-backend.railway.app`
   - `VITE_SOCKET_URL=wss://seu-backend.railway.app`

## 📁 Estrutura do Projeto

```
supkvn-saas/
├── backend/           # API Node.js + Express
│   ├── src/
│   ├── prisma/        # Schema do banco
│   └── package.json
├── frontend/          # App React
│   ├── src/
│   └── package.json
├── widget/            # Widget embedável
│   ├── src/
│   └── package.json
├── docker-compose.yml # Serviços locais
├── railway.toml       # Config Railway
└── README.md
```

## 🔐 Autenticação

Login de demonstração:
- **Email**: demo@supkvn.com
- **Senha**: demo123

## 📚 Documentação

Veja o arquivo `CLAUDE.md` para documentação completa do desenvolvimento e arquitetura.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ usando Claude Code**