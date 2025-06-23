# 🚂 Railway Microservices - Guia Completo

## 🏗️ Arquitetura Recomendada

### Serviços Separados no Railway:

1. **Backend API** (Node.js + Express)
2. **Frontend** (React - opcional, melhor usar Vercel)
3. **Database** (PostgreSQL - provisionado automaticamente)
4. **Redis** (Cache - opcional)
5. **Widget** (Build estático - melhor usar CDN)

## 📋 Estrutura Ideal

```
Railway Project: supkvn-saas
├── 🔧 backend-api          # Serviço principal
├── 🗄️ postgresql          # Database (auto-provisionado)
├── 🔴 redis               # Cache (opcional)
└── 📊 monitoring          # Logs/metrics (futuro)

Externos:
├── 🌐 Vercel             # Frontend React
└── 📦 CDN                # Widget embedável
```

## 🚀 Configuração Passo a Passo

### 1. Estruturar o Repositório

Primeiro, vamos criar uma estrutura monorepo adequada:

```
supkvn-saas/
├── apps/
│   ├── backend/           # API principal
│   ├── frontend/          # React app
│   └── widget/            # Widget embedável
├── packages/              # Código compartilhado
│   ├── database/          # Prisma schema
│   └── types/             # Types TypeScript
├── railway.json          # Configuração Railway
└── package.json          # Root workspace
```

### 2. Configurar Backend no Railway

**2.1. Criar `railway.json` na raiz:**

```json
{
  "deploy": {
    "startCommand": "cd apps/backend && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  },
  "build": {
    "builder": "nixpacks",
    "buildCommand": "cd apps/backend && npm run build"
  }
}
```

**2.2. Criar serviço backend:**

```bash
# No seu terminal
railway service create backend-api
railway service connect backend-api
railway up apps/backend
```

### 3. Configurar Database

**PostgreSQL é provisionado automaticamente:**

```bash
# Adicionar PostgreSQL ao projeto
railway add postgresql

# A DATABASE_URL será gerada automaticamente
# railway variables mostrará: DATABASE_URL=postgresql://...
```

### 4. Configurar Redis (Opcional)

```bash
# Adicionar Redis para cache
railway add redis

# REDIS_URL será gerada automaticamente
# railway variables mostrará: REDIS_URL=redis://...
```

## 🔧 Scripts de Configuração

### Script 1: Configuração Inicial

```bash
#!/bin/bash
# setup-microservices.sh

echo "🚂 Configurando Microserviços Railway"

# 1. Criar serviço backend
railway service create backend-api
railway service connect backend-api

# 2. Adicionar PostgreSQL
railway add postgresql

# 3. Adicionar Redis (opcional)
railway add redis

# 4. Configurar variáveis essenciais
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_SECRET=supkvn_jwt_$(date +%s)_secure"
railway variables --set "FRONTEND_URL=https://supkvn-saas.vercel.app"

echo "✅ Microserviços configurados!"
```

### Script 2: Deploy Backend

```bash
#!/bin/bash
# deploy-backend.sh

echo "🚀 Deploy do Backend"

# Conectar ao serviço backend
railway service connect backend-api

# Deploy do backend
railway up apps/backend

# Verificar status
railway status
railway logs
```

## 📁 Estrutura de Pastas Recomendada

Vamos reestruturar o projeto atual:

```bash
# Mover arquivos para estrutura monorepo
mkdir -p apps packages

# Mover backend
mv backend apps/

# Mover frontend  
mv frontend apps/

# Mover widget
mv widget apps/

# Criar package shared
mkdir packages/database
mv apps/backend/prisma packages/database/

# Criar types compartilhados
mkdir packages/types
```

## 🌐 Deployment Strategy

### Backend (Railway):
- **Serviço**: backend-api
- **Database**: PostgreSQL (auto)
- **Cache**: Redis (opcional)
- **URL**: https://backend-api-production.up.railway.app

### Frontend (Vercel):
- **Platform**: Vercel (melhor para React)
- **Build**: `cd apps/frontend && npm run build`
- **URL**: https://supkvn-saas.vercel.app

### Widget (CDN):
- **Build**: Static files
- **CDN**: Vercel/Netlify/CloudFlare
- **URL**: https://cdn.supkvn.com/widget.js

## 🔗 Conexões Entre Serviços

### Variáveis de Ambiente:

**Backend:**
```bash
# Database (auto-gerada)
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis (auto-gerada) 
REDIS_URL=redis://user:pass@host:port

# Configurações
NODE_ENV=production
JWT_SECRET=sua_chave_super_segura
FRONTEND_URL=https://supkvn-saas.vercel.app
WIDGET_URL=https://cdn.supkvn.com
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://backend-api-production.up.railway.app
VITE_SOCKET_URL=wss://backend-api-production.up.railway.app
VITE_WIDGET_URL=https://cdn.supkvn.com/widget.js
```

## 🎯 Comandos para Implementar Agora

### 1. Criar Serviço Backend:
```bash
railway service create backend
railway service connect backend
```

### 2. Adicionar Database:
```bash
railway add postgresql
```

### 3. Deploy Backend:
```bash
railway up backend/
```

### 4. Verificar:
```bash
railway status
railway variables
railway logs
```

## 🔍 Monitoramento

### URLs para Verificar:
- **API Health**: https://[seu-backend].railway.app/health
- **Database**: Conectado automaticamente
- **Logs**: `railway logs -f`
- **Metrics**: Railway Dashboard

## 💡 Vantagens desta Arquitetura

1. **Escalabilidade**: Cada serviço escala independentemente
2. **Deploy**: Deploy independente de cada componente
3. **Monitoramento**: Logs e métricas separados
4. **Custos**: Paga apenas pelo que usa
5. **Performance**: CDN para assets estáticos
6. **Manutenção**: Easier debugging e updates

## 🚀 Próximos Passos

1. ✅ Criar serviço backend no Railway
2. ✅ Adicionar PostgreSQL
3. ✅ Deploy backend
4. ⏳ Deploy frontend no Vercel
5. ⏳ Build widget para CDN
6. ⏳ Configurar domínios customizados

**Quer que eu execute estes comandos para estruturar os microserviços?** 🤔