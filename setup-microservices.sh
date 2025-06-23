#!/bin/bash

echo "🚂 Configurando Microserviços Railway - SaaS de Atendimento"
echo "========================================================="

# Verificar se está conectado ao projeto
if ! railway status > /dev/null 2>&1; then
    echo "❌ Não conectado ao Railway. Execute: railway link"
    exit 1
fi

echo "✅ Conectado ao projeto Railway"

# 1. Criar e conectar ao serviço backend
echo ""
echo "1. 🔧 Configurando serviço Backend..."
railway service create backend-api 2>/dev/null || echo "Serviço backend-api já existe"

# 2. Adicionar PostgreSQL
echo ""
echo "2. 🗄️ Adicionando PostgreSQL..."
railway add postgresql 2>/dev/null || echo "PostgreSQL já adicionado"

# 3. Adicionar Redis (opcional)
echo ""
echo "3. 🔴 Adicionando Redis para cache..."
railway add redis 2>/dev/null || echo "Redis já adicionado"

# 4. Conectar ao serviço backend para configurar variáveis
echo ""
echo "4. ⚙️ Configurando variáveis de ambiente..."
railway service connect backend-api

# Configurar variáveis essenciais
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_SECRET=supkvn_jwt_$(date +%s)_secure_key"
railway variables --set "FRONTEND_URL=https://supkvn-saas.vercel.app"
railway variables --set "LOG_LEVEL=info"

echo ""
echo "5. 📊 Status atual:"
railway status
echo ""
railway variables

echo ""
echo "✅ Microserviços configurados com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. railway up backend/     # Deploy do backend"
echo "   2. railway logs           # Verificar logs"
echo "   3. railway open           # Abrir no browser"
echo ""
echo "🌐 URLs esperadas:"
echo "   Backend API: https://backend-api-production.up.railway.app"
echo "   Health: https://backend-api-production.up.railway.app/health"