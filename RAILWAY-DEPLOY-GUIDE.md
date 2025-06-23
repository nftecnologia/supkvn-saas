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
