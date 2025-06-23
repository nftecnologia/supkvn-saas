# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto: SaaS de Atendimento Inteligente

Um SaaS completo para atendimento ao cliente que integra chat, e-mail e IA para oferecer suporte automatizado e personalizado.

### Funcionalidades Principais
1. **Chat ao Vivo**: Widget embedável para sites dos clientes
2. **E-mail**: Integração IMAP/SMTP para gerenciar atendimento por e-mail
3. **IA Inteligente**: Agente que responde no chat e e-mail usando base de conhecimento personalizada

### Stack Tecnológica

**Frontend:**
- React.js + TypeScript
- Tailwind CSS
- Vite (build tool)
- React Router (navegação)
- Socket.io-client (WebSocket)
- Tanstack Query (estado e cache)

**Backend:**
- Node.js + Express + TypeScript
- Socket.io (WebSocket para chat)
- PostgreSQL (banco principal)
- Redis (cache e sessões)
- RabbitMQ (filas de processamento)

**Serviços Externos:**
- Stack-Auth (autenticação)
- Pinecone (vetorização de dados)
- OpenAI/Anthropic (modelos de IA)
- Cloudflare R2 (storage de arquivos)
- Resend/Mailgun (envio de e-mails)

### Comandos de Desenvolvimento

**Backend:**
```bash
cd backend
npm install
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run test         # Testes unitários
npm run lint         # ESLint
npm run db:migrate   # Rodar migrações
npm run db:seed      # Popular banco com dados iniciais
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test         # Testes com Vitest
npm run lint         # ESLint
```

**Widget:**
```bash
cd widget
npm install
npm run dev          # Desenvolvimento
npm run build        # Build para produção
```

**Docker:**
```bash
docker-compose up -d     # Subir todos os serviços
docker-compose down      # Parar serviços
docker-compose logs -f   # Ver logs
```

### Arquitetura da Aplicação

#### Backend - Estrutura de Pastas
```
backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── services/        # Lógica de negócio
│   ├── models/          # Modelos do banco
│   ├── routes/          # Definição das rotas
│   ├── middleware/      # Middlewares
│   ├── config/          # Configurações
│   ├── utils/           # Utilitários
│   └── types/           # Tipos TypeScript
├── tests/               # Testes unitários
├── migrations/          # Migrações do banco
└── docker/              # Configurações Docker
```

#### Frontend - Estrutura de Pastas
```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── hooks/           # Custom hooks
│   ├── services/        # Serviços/API
│   ├── store/           # Estado global
│   ├── utils/           # Utilitários
│   └── types/           # Tipos TypeScript
├── public/              # Assets estáticos
└── tests/               # Testes
```

### Rotas da API

#### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/forgot-password` - Recuperar senha
- `POST /auth/reset-password` - Redefinir senha

#### Chat
- `GET /chat/conversations` - Listar conversas
- `POST /chat/conversations` - Criar conversa
- `GET /chat/conversations/:id/messages` - Mensagens da conversa
- `POST /chat/conversations/:id/messages` - Enviar mensagem
- `WebSocket /chat` - Chat em tempo real

#### E-mail
- `POST /email/connect` - Conectar conta de e-mail
- `GET /email/inbox` - Caixa de entrada
- `GET /email/:id` - Detalhes do e-mail
- `POST /email/:id/reply` - Responder e-mail
- `POST /email/send` - Enviar e-mail

#### Agente IA
- `POST /agent/chat` - Conversar com IA
- `POST /agent/knowledge` - Adicionar conhecimento
- `GET /agent/knowledge` - Listar base de conhecimento
- `DELETE /agent/knowledge/:id` - Remover conhecimento
- `POST /agent/train` - Treinar agente

#### Clientes
- `GET /clients/profile` - Perfil do cliente
- `PUT /clients/profile` - Atualizar perfil
- `GET /clients/settings` - Configurações
- `PUT /clients/settings` - Atualizar configurações

### Banco de Dados (PostgreSQL)

#### Tabelas Principais
- `users` - Usuários do sistema
- `clients` - Dados dos clientes
- `conversations` - Conversas (chat/email)
- `messages` - Mensagens das conversas
- `emails` - Dados dos e-mails
- `knowledge_base` - Base de conhecimento
- `files` - Arquivos enviados
- `settings` - Configurações por cliente

### Padrões de Desenvolvimento

#### Qualidade de Código
- **TypeScript**: Tipagem estática em todo o projeto
- **ESLint + Prettier**: Padronização de código
- **Clean Code**: Funções pequenas, nomes descritivos
- **SOLID**: Princípios de design orientado a objetos

#### Arquitetura
- **MVC**: Model-View-Controller no backend
- **Layered Architecture**: Separação em camadas
- **Dependency Injection**: Injeção de dependências
- **Error Handling**: Tratamento centralizado de erros

#### Testes
- **Unit Tests**: Testes unitários com Jest
- **Integration Tests**: Testes de integração
- **E2E Tests**: Testes end-to-end com Playwright

### Deploy e Infraestrutura

#### Desenvolvimento Local
```bash
# Clonar repositório
git clone <repo-url>
cd supkvn

# Instalar dependências
npm run install:all

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Subir serviços com Docker
docker-compose up -d

# Rodar migrações
npm run db:migrate

# Iniciar desenvolvimento
npm run dev
```

#### Produção
- **Backend**: Railway ou Heroku
- **Frontend**: Vercel ou Netlify
- **Banco**: PostgreSQL na nuvem (Railway, Supabase)
- **Cache**: Redis na nuvem (Upstash, Redis Cloud)
- **Storage**: Cloudflare R2

### Variáveis de Ambiente

#### Backend (.env)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
OPENAI_API_KEY=...
PINECONE_API_KEY=...
CLOUDFLARE_R2_ACCESS_KEY=...
RESEND_API_KEY=...
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
VITE_WIDGET_URL=http://localhost:3001
```

### Observações Importantes

1. **Segurança**: Todas as rotas protegidas por autenticação JWT
2. **Rate Limiting**: Limitação de requisições por IP
3. **Validação**: Validação de dados com Zod
4. **Logs**: Sistema de logs estruturado
5. **Monitoramento**: Métricas e alertas configurados
6. **Backup**: Backup automático do banco de dados

## ✅ Status do Desenvolvimento

### Fase 1: Setup Inicial - CONCLUÍDA
- [x] **Estrutura do Projeto**: Diretórios backend, frontend e widget criados
- [x] **Backend**: Node.js + Express + TypeScript configurado
  - [x] package.json com dependências principais
  - [x] tsconfig.json configurado
  - [x] Estrutura de pastas (controllers, services, models, etc.)
  - [x] Servidor básico com Express e Socket.io
  - [x] Logger configurado com Winston
  - [x] Middleware de tratamento de erros
  - [x] Arquivo .env.example criado
- [x] **Frontend**: React + TypeScript + Vite configurado
  - [x] package.json com dependências do React
  - [x] Tailwind CSS configurado
  - [x] Estrutura de pastas (components, pages, hooks, etc.)
  - [x] Arquivo .env.example criado
- [x] **Widget**: TypeScript + Vite configurado
  - [x] package.json configurado
  - [x] Widget básico de chat implementado
  - [x] Configuração do Vite para build UMD
- [x] **Docker**: Configuração completa
  - [x] docker-compose.yml com todos os serviços
  - [x] Dockerfiles para backend, frontend e widget
  - [x] Serviços PostgreSQL, Redis e RabbitMQ
- [x] **Workspace**: Scripts de gerenciamento
  - [x] package.json root com scripts para todos os módulos
  - [x] .gitignore configurado
  - [x] .env.example global

### Próximas Fases

#### Fase 2: Implementação do Backend - CONCLUÍDA
- [x] **Configuração do Prisma ORM**: Schema completo com todos os modelos
- [x] **Schema do banco de dados**: Tabelas para users, clients, conversations, messages, emails, knowledge_base, files, settings
- [x] **Sistema de autenticação JWT**: Registro, login, refresh token, forgot/reset password
- [x] **Rotas da API**: 
  - [x] `/api/auth/*` - Autenticação completa
  - [x] `/api/chat/*` - Conversas e mensagens
  - [x] `/api/agent/*` - IA e base de conhecimento
- [x] **Serviços de IA**: OpenAI integration com base de conhecimento personalizada
- [x] **Sistema de e-mail**: SMTP/Nodemailer para envio de e-mails
- [x] **WebSocket**: Chat em tempo real com Socket.io
- [x] **Middleware**: Autenticação, validação, rate limiting, error handling

#### Fase 3: Implementação do Frontend - CONCLUÍDA
- [x] **Sistema de roteamento**: React Router com rotas protegidas e públicas
- [x] **Páginas principais**: 
  - [x] Dashboard com métricas e visão geral
  - [x] Chat com lista de conversas e interface de mensagens em tempo real
  - [x] Knowledge com gerenciamento da base de conhecimento da IA
  - [x] Settings com configurações completas (geral, widget, IA, email, API)
- [x] **Componentes reutilizáveis**: Layout, Sidebar, Header, LoadingSpinner, Modais
- [x] **Sistema de estado global**: Zustand para autenticação e estado da aplicação
- [x] **Integração com APIs**: Axios + React Query para todas as operações
- [x] **Sistema de autenticação**: Login, registro, tokens JWT, rotas protegidas
- [x] **Interface responsiva**: Tailwind CSS com design system completo
- [x] **Páginas de autenticação**: Login e Register com validação completa
- [x] **Notificações**: React Hot Toast para feedback do usuário

#### Fase 4: Integração e Testes - CONCLUÍDA
- [x] **Instalação e setup**: Todas as dependências instaladas e configuradas
- [x] **Backend server startup**: Servidor Node.js rodando com sucesso em porta 3000
- [x] **Database setup**: SQLite configurado, migrações executadas, dados de seed carregados
- [x] **Frontend server startup**: React app rodando com sucesso em porta 5173
- [x] **Widget build**: Widget embedável construído com sucesso
- [x] **Health checks**: Endpoint de saúde funcionando e retornando status correto
- [x] **Database connectivity**: Prisma conectado ao SQLite com sucesso
- [x] **Redis disabled**: Redis temporariamente desabilitado para facilitar desenvolvimento
- [ ] Testes unitários backend (pendente)
- [ ] Testes unitários frontend (pendente)
- [ ] Testes E2E completos (pendente)
- [ ] Performance testing (pendente)
- [ ] Security testing (pendente)

#### Fase 5: Deploy e Produção - EM ANDAMENTO
- [x] **Repositório GitHub**: https://github.com/nftecnologia/supkvn-saas
- [x] **Configuração de produção**: PostgreSQL, enums, Railway.toml
- [x] **Scripts de deploy**: Build e start otimizados para Railway
- [x] **Variáveis de ambiente**: Configuradas para produção
- [ ] Deploy no Railway (manual - instruções abaixo)
- [ ] Configuração de domínio
- [ ] Monitoramento e logs
- [ ] Backup automatizado

## 🚀 Instruções de Deploy

### Deploy no Railway

1. **Instalar Railway CLI** (se não tiver):
```bash
npm install -g @railway/cli
```

2. **Fazer login no Railway**:
```bash
railway login
```

3. **Conectar ao repositório**:
```bash
cd /caminho/para/supkvn
railway init
```

4. **Configurar variáveis de ambiente no Railway**:
   - Acesse https://railway.app/dashboard
   - Selecione seu projeto
   - Vá em "Variables" e adicione:
   ```
   NODE_ENV=production
   JWT_SECRET=seu_jwt_secret_super_seguro_aqui
   OPENAI_API_KEY=sua_chave_openai_aqui
   FRONTEND_URL=https://seu-dominio.railway.app
   ```

5. **Deploy automático**:
   - O Railway detectará automaticamente o repositório
   - O build será executado conforme `railway.toml`
   - PostgreSQL será provisionado automaticamente

6. **Verificar deploy**:
```bash
railway status
railway logs
```

### Deploy do Frontend (Vercel)

1. **Conectar repositório no Vercel**:
   - Acesse https://vercel.com
   - Conecte o repositório GitHub
   - Configure Build Settings:
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/dist`

2. **Configurar variáveis de ambiente**:
   ```
   VITE_API_URL=https://seu-backend.railway.app
   VITE_SOCKET_URL=wss://seu-backend.railway.app
   ```

### URLs do Projeto
- **Repositório**: https://github.com/nftecnologia/supkvn-saas
- **Backend (Railway)**: https://supkvn-saas-backend.railway.app (será gerado)
- **Frontend (Vercel)**: https://supkvn-saas.vercel.app (será gerado)
- **Documentação**: Ver CLAUDE.md no repositório