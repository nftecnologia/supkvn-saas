#!/bin/bash

echo "🚂 Script de Deploy Railway - SaaS de Atendimento Inteligente"
echo "============================================================"

# Verificar se está logado
echo "1. Verificando login..."
if railway whoami; then
    echo "✅ Logado no Railway"
else
    echo "❌ Não logado. Execute: railway login"
    exit 1
fi

# Verificar se projeto está conectado
echo "2. Verificando conexão do projeto..."
if railway status; then
    echo "✅ Projeto conectado"
else
    echo "❌ Projeto não conectado. Execute: railway link"
    echo "   Selecione o projeto 'supkvn-saas' na lista"
    exit 1
fi

# Configurar variáveis de ambiente essenciais
echo "3. Configurando variáveis de ambiente..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=supkvn_jwt_secret_production_$(date +%s)_secure
railway variables set FRONTEND_URL=https://supkvn-saas.vercel.app

echo "4. Variáveis opcionais (configure manualmente se necessário):"
echo "   railway variables set OPENAI_API_KEY=sk-sua_chave_openai"

# Fazer deploy
echo "5. Iniciando deploy..."
railway up

echo "✅ Deploy iniciado!"
echo "   Acompanhe os logs: railway logs"
echo "   Status: railway status"
echo "   URL será gerada automaticamente pelo Railway"