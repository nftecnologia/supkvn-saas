#!/bin/bash

echo "🚂 Deploy Manual Railway - SaaS de Atendimento Inteligente"
echo "========================================================="

echo "1. Status atual:"
railway status

echo ""
echo "2. Tentativa de deploy direto:"
railway up --service supkvn-saas 2>/dev/null || \
railway up --service backend 2>/dev/null || \
railway up --service main 2>/dev/null || \
railway up

echo ""
echo "3. Se falhar, execute manualmente:"
echo "   railway service"
echo "   Selecione o serviço quando aparecer"
echo "   railway up"

echo ""
echo "4. Para configurar variáveis após deploy:"
echo "   railway variables --set 'NODE_ENV=production'"
echo "   railway variables --set 'JWT_SECRET=supkvn_jwt_$(date +%s)_secure'"

echo ""
echo "5. Para verificar status:"
echo "   railway status"
echo "   railway logs"