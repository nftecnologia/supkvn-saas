# 🚀 Instruções de Deploy Railway

## Status Atual
✅ **Railway CLI**: Instalado (v4.5.3)  
✅ **Login**: Logado como nftecnologia@proton.me  
✅ **Repositório**: https://github.com/nftecnologia/supkvn-saas  
✅ **Configuração**: railway.toml criado  
⏳ **Projeto Railway**: Precisa ser criado/conectado  

## Passo a Passo

### 1. Criar Projeto no Railway Dashboard

1. Acesse: https://railway.app/dashboard
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha: **`nftecnologia/supkvn-saas`**
5. Configure:
   - **Project Name**: `supkvn-saas`
   - **Environment**: `production`
   - Deixe o Railway detectar automaticamente (Node.js)

### 2. Conectar Projeto Localmente

```bash
cd /Users/oliveira/Desktop/supkvn
railway link
# Selecione 'supkvn-saas' na lista quando aparecer
```

### 3. Executar Deploy Automático

```bash
./deploy-railway.sh
```

**OU manualmente:**

```bash
# Configurar variáveis essenciais
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=supkvn_jwt_secret_$(date +%s)_secure
railway variables set FRONTEND_URL=https://supkvn-saas.vercel.app

# Deploy
railway up
```

### 4. Verificar Deploy

```bash
./check-deploy.sh
```

**OU manualmente:**

```bash
railway status
railway logs
```

## Variáveis de Ambiente Essenciais

### Obrigatórias:
- `NODE_ENV=production`
- `JWT_SECRET=sua_chave_super_segura` (gerada automaticamente)
- `DATABASE_URL` (gerada automaticamente pelo Railway)

### Opcionais:
- `OPENAI_API_KEY=sk-sua_chave_openai`
- `FRONTEND_URL=https://supkvn-saas.vercel.app`

## Comandos Úteis

```bash
# Status do projeto
railway status

# Logs em tempo real
railway logs -f

# Variáveis configuradas
railway variables

# Redeploy
railway up

# Abrir no browser
railway open
```

## URLs Esperadas

Após o deploy, você terá:
- **Backend API**: https://supkvn-saas-production.up.railway.app
- **Health Check**: https://supkvn-saas-production.up.railway.app/health
- **API Docs**: https://supkvn-saas-production.up.railway.app/api

## Troubleshooting

### Build Falhando:
```bash
railway logs
```
Verifique se todas as dependências estão no package.json

### Database Error:
O Railway provisiona PostgreSQL automaticamente. 
Verifique se `DATABASE_URL` está configurada:
```bash
railway variables
```

### Timeout de Health Check:
Aumentar timeout no railway.toml (já configurado para 300s)

## Próximos Passos

1. ✅ Deploy Railway (backend)
2. ⏳ Deploy Vercel (frontend)
3. ⏳ Configurar domínio personalizado
4. ⏳ Testes de produção

## Credenciais de Teste

Após deploy, teste com:
- **Email**: demo@supkvn.com
- **Senha**: demo123