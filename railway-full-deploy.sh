#!/bin/bash

echo "🚂 Deploy Completo Railway - Todos os Serviços"
echo "=============================================="
echo "Backend + Frontend + Widget + Databases"
echo ""

# Verificar conexão
if ! railway status > /dev/null 2>&1; then
    echo "❌ Não conectado ao Railway. Execute: railway link"
    exit 1
fi

echo "✅ Conectado ao projeto Railway: supkvn-saas"
echo ""

# 1. Criar configuração para Backend
echo "1. 🔧 Configurando Backend Service..."
cat > backend/railway.json << 'EOF'
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "always"
  },
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  }
}
EOF
echo "✅ Backend railway.json criado"

# 2. Criar configuração para Frontend
echo ""
echo "2. 🌐 Configurando Frontend Service..."
cat > frontend/railway.json << 'EOF'
{
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
    "healthcheckTimeout": 300,
    "restartPolicyType": "always"
  },
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  }
}
EOF
echo "✅ Frontend railway.json criado"

# 3. Criar configuração para Widget
echo ""
echo "3. 📦 Configurando Widget Service..."
cat > widget/railway.json << 'EOF'
{
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
    "healthcheckTimeout": 300,
    "restartPolicyType": "always"
  },
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  }
}
EOF
echo "✅ Widget railway.json criado"

# 4. Atualizar package.json do frontend para produção
echo ""
echo "4. 📝 Atualizando scripts de produção..."

# Adicionar script preview no frontend se não existir
if ! grep -q '"preview"' frontend/package.json; then
    # Backup
    cp frontend/package.json frontend/package.json.bak
    
    # Adicionar preview script
    sed -i '' 's/"build": "vite build"/"build": "vite build",\n    "preview": "vite preview"/' frontend/package.json
    echo "✅ Script preview adicionado ao frontend"
fi

# Adicionar script preview no widget se não existir
if ! grep -q '"preview"' widget/package.json; then
    # Backup
    cp widget/package.json widget/package.json.bak
    
    # Adicionar preview script
    sed -i '' 's/"build": "vite build"/"build": "vite build",\n    "preview": "vite preview"/' widget/package.json
    echo "✅ Script preview adicionado ao widget"
fi

echo ""
echo "5. 📋 Criando guia de deploy manual..."

cat > RAILWAY-DEPLOY-GUIDE.md << 'EOF'
# 🚂 Railway Deploy Guide - Todos os Serviços

## Serviços a Criar no Dashboard Railway

### 1. Backend API
- **Add Service** → **GitHub Repo** 
- **Root Directory**: `backend/`
- **Service Name**: `backend-api`
- **Auto-Deploy**: ✅ Enabled

### 2. Frontend App  
- **Add Service** → **GitHub Repo**
- **Root Directory**: `frontend/`
- **Service Name**: `frontend-app`
- **Auto-Deploy**: ✅ Enabled

### 3. Widget Service
- **Add Service** → **GitHub Repo** 
- **Root Directory**: `widget/`
- **Service Name**: `widget-service`
- **Auto-Deploy**: ✅ Enabled

### 4. PostgreSQL Database
- **Add Service** → **Database** → **PostgreSQL**
- **Name**: `postgresql`
- **Auto-generates**: `DATABASE_URL`

### 5. Redis Cache
- **Add Service** → **Database** → **Redis**
- **Name**: `redis` 
- **Auto-generates**: `REDIS_URL`

## Variáveis de Ambiente por Serviço

### Backend API:
```
NODE_ENV=production
JWT_SECRET=supkvn_jwt_super_secure_2024
LOG_LEVEL=info
FRONTEND_URL=https://frontend-app-production.up.railway.app
WIDGET_URL=https://widget-service-production.up.railway.app
```

### Frontend App:
```
VITE_API_URL=https://backend-api-production.up.railway.app
VITE_SOCKET_URL=wss://backend-api-production.up.railway.app
VITE_WIDGET_URL=https://widget-service-production.up.railway.app
```

### Widget Service:
```
VITE_API_URL=https://backend-api-production.up.railway.app
VITE_SOCKET_URL=wss://backend-api-production.up.railway.app
```

## URLs Finais Esperadas

- **Backend API**: https://backend-api-production.up.railway.app
- **Frontend App**: https://frontend-app-production.up.railway.app  
- **Widget Service**: https://widget-service-production.up.railway.app
- **Health Check**: https://backend-api-production.up.railway.app/health

## Ordem de Deploy

1. ✅ Databases (PostgreSQL + Redis)
2. ✅ Backend API 
3. ✅ Frontend App
4. ✅ Widget Service
5. ✅ Configurar variáveis de ambiente
6. ✅ Testar todas as URLs

## Comandos CLI (Após criar no dashboard)

```bash
# Conectar a cada serviço e fazer deploy
railway service connect backend-api
railway up backend/

railway service connect frontend-app  
railway up frontend/

railway service connect widget-service
railway up widget/
```
EOF

echo "✅ Guia de deploy criado: RAILWAY-DEPLOY-GUIDE.md"

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse: https://railway.com/project/688002ed-7da7-4b86-a2a6-349af687ac4a"
echo "2. Adicione os 5 serviços conforme RAILWAY-DEPLOY-GUIDE.md"
echo "3. Configure as variáveis de ambiente"
echo "4. Aguarde os deploys automáticos"
echo ""
echo "🌐 URLs que serão geradas:"
echo "   Backend:  https://backend-api-production.up.railway.app"
echo "   Frontend: https://frontend-app-production.up.railway.app"
echo "   Widget:   https://widget-service-production.up.railway.app"