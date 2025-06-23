#!/bin/bash

echo "🚀 Deploy Backend Railway - SaaS de Atendimento"
echo "=============================================="

# Verificar conexão
if ! railway status > /dev/null 2>&1; then
    echo "❌ Não conectado ao Railway. Execute: railway link"
    exit 1
fi

echo "✅ Conectado ao projeto Railway"

# Conectar ao serviço backend
echo ""
echo "1. 🔧 Conectando ao serviço backend..."
railway service connect backend-api

# Verificar se variáveis estão configuradas
echo ""
echo "2. ⚙️ Verificando variáveis de ambiente..."
railway variables

# Fazer deploy apenas do backend
echo ""
echo "3. 🚀 Fazendo deploy do backend..."
echo "   Enviando código do diretório: ./backend"

# Deploy do backend (Railway detecta automaticamente Node.js)
railway up backend/

echo ""
echo "4. 📊 Verificando status do deploy..."
railway status

echo ""
echo "5. 📋 Logs recentes:"
railway logs --tail 20

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🔍 Para monitorar:"
echo "   railway logs -f           # Logs em tempo real"
echo "   railway status           # Status do serviço"
echo "   railway open             # Abrir no browser"
echo ""
echo "🌐 Testar endpoints:"
echo "   curl https://[sua-url].railway.app/health"
echo "   curl https://[sua-url].railway.app/api/auth"