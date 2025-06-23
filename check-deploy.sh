#!/bin/bash

echo "🔍 Verificação de Deploy - SaaS de Atendimento Inteligente"
echo "=========================================================="

# Verificar status do Railway
echo "1. Status do Railway:"
railway status

echo ""
echo "2. Logs recentes:"
railway logs --tail 20

echo ""
echo "3. Variáveis de ambiente configuradas:"
railway variables

echo ""
echo "4. Testando endpoints (se URL estiver disponível):"
if railway status | grep -q "https://"; then
    URL=$(railway status | grep -o 'https://[^[:space:]]*')
    echo "   URL encontrada: $URL"
    
    echo "   Testando health endpoint..."
    curl -s "$URL/health" | head -n 5
    
    echo ""
    echo "   Testando API auth (deve retornar 404 ou estrutura JSON)..."
    curl -s "$URL/api/auth" | head -n 3
else
    echo "   URL ainda não disponível. Aguarde o deploy completar."
fi

echo ""
echo "✅ Verificação concluída!"
echo "   Para logs em tempo real: railway logs -f"