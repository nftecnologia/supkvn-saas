# 🔧 Railway Troubleshooting Guide

## ❌ Problemas Comuns e Soluções

### 1. Erro: `npm ci` failed (exit code 1)

**Causa**: Falta de `package-lock.json` ou dependências conflitantes

**Solução aplicada:**
- ✅ Removidos Dockerfiles (Railway usa Nixpacks)
- ✅ Criados `.nixpacks.toml` customizados
- ✅ Alterado `npm ci` para `npm install --production=false`
- ✅ Adicionados `.nvmrc` com Node.js 18

**Arquivos corrigidos:**
- `backend/.nixpacks.toml`
- `frontend/.nixpacks.toml` 
- `widget/.nixpacks.toml`
- `*/.nvmrc`

### 2. Build Error: Dependencies Missing

**Se ainda falhar, verificar:**

```bash
# Verificar package.json
cat backend/package.json | grep '"engines"'

# Verificar se todas as deps estão listadas
npm run build  # Local test
```

**Solução alternativa:**
Criar `package-lock.json` manualmente:

```bash
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
cd ../widget && rm -rf node_modules && npm install
```

### 3. Prisma Build Error

**Erro**: `Prisma Client generation failed`

**Solução**:
```bash
# No .nixpacks.toml do backend:
[phases.build]
cmds = [
  "npx prisma generate",
  "npx prisma migrate deploy",
  "npm run build"
]
```

### 4. Environment Variables Missing

**Erro**: `DATABASE_URL is not defined`

**Solução**:
1. Adicionar PostgreSQL no Railway Dashboard
2. Verificar se `DATABASE_URL` foi gerada automaticamente
3. Configurar outras variáveis necessárias

### 5. Port Binding Error

**Erro**: `Error: listen EADDRINUSE`

**Solução**: Railway injeta `$PORT` automaticamente
```javascript
const PORT = process.env.PORT || 3000;
```

## 🚀 Deploy Steps Corretos

### 1. Via Railway Dashboard:

1. **Add Service** → **GitHub Repo**
2. **Configure Root Directory**: 
   - Backend: `backend/`
   - Frontend: `frontend/`
   - Widget: `widget/`
3. **Auto-deploy**: ✅ Enabled
4. **Environment**: production

### 2. Configurar Variáveis:

**Backend:**
```
NODE_ENV=production
JWT_SECRET=secure_key_here
LOG_LEVEL=info
```

**Frontend:**
```
VITE_API_URL=https://backend-api-production.up.railway.app
```

### 3. Verificar Build Logs:

```bash
railway logs -f
railway status
```

## 🔍 Debug Commands

```bash
# Verificar status
railway status

# Logs em tempo real
railway logs -f

# Variáveis configuradas
railway variables

# Reconectar se necessário
railway link

# Redeploy
railway up
```

## 📋 Checklist de Deploy

- [ ] ✅ Service criado no Railway Dashboard
- [ ] ✅ Root directory configurado corretamente
- [ ] ✅ .nixpacks.toml presente
- [ ] ✅ .nvmrc com Node.js 18
- [ ] ✅ package.json com scripts corretos
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ PostgreSQL adicionado (para backend)
- [ ] ✅ Auto-deploy habilitado

## 🆘 Se Nada Funcionar

1. **Simplificar**: Deploy apenas backend primeiro
2. **Logs**: `railway logs -f` para ver erro específico
3. **Local Test**: Verificar se `npm run build` funciona localmente
4. **Support**: Railway Discord/GitHub Issues

## ✅ Arquivos Atualizados

```
backend/
├── .nixpacks.toml    # Build config otimizado
├── .nvmrc           # Node.js 18
└── railway.json     # Deploy config

frontend/
├── .nixpacks.toml   # Build config otimizado  
├── .nvmrc          # Node.js 18
└── railway.json    # Deploy config

widget/
├── .nixpacks.toml  # Build config otimizado
├── .nvmrc         # Node.js 18
└── railway.json   # Deploy config
```

**Agora o deploy deve funcionar! 🚀**