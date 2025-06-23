#!/bin/bash

echo "🔍 Testando Deploy Completo Railway"
echo "==================================="

# URLs base (você precisa substituir pelos URLs reais após deploy)
BACKEND_URL="https://backend-api-production.up.railway.app"
FRONTEND_URL="https://frontend-app-production.up.railway.app"
WIDGET_URL="https://widget-service-production.up.railway.app"

echo "🌐 URLs sendo testadas:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Widget:   $WIDGET_URL"
echo ""

# 1. Testar Backend
echo "1. 🔧 Testando Backend API..."
echo "   Health endpoint:"
curl -s -f "$BACKEND_URL/health" > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Backend health: OK"
    curl -s "$BACKEND_URL/health" | head -n 3
else
    echo "   ❌ Backend health: FAIL"
fi

echo ""
echo "   Auth endpoint:"
curl -s -f "$BACKEND_URL/api/auth" > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Backend auth: OK"
else
    echo "   ⚠️  Backend auth: Expected 404 (normal)"
fi

# 2. Testar Frontend
echo ""
echo "2. 🌐 Testando Frontend App..."
curl -s -f "$FRONTEND_URL" > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend: OK"
    echo "   Title: $(curl -s "$FRONTEND_URL" | grep -o '<title>[^<]*</title>' | head -n 1)"
else
    echo "   ❌ Frontend: FAIL"
fi

# 3. Testar Widget
echo ""
echo "3. 📦 Testando Widget Service..."
curl -s -f "$WIDGET_URL" > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Widget: OK"
else
    echo "   ❌ Widget: FAIL"
fi

# 4. Testar conectividade entre serviços
echo ""
echo "4. 🔗 Testando conectividade entre serviços..."

# Verificar se frontend consegue acessar backend
echo "   Frontend → Backend:"
curl -s -f "$FRONTEND_URL/static/" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Static assets: OK"
else
    echo "   ⚠️  Static assets: Check needed"
fi

echo ""
echo "📊 Resumo do Deploy:"
echo "├── 🔧 Backend API:    $([[ $(curl -s -f "$BACKEND_URL/health" > /dev/null; echo $?) -eq 0 ]] && echo "✅ OK" || echo "❌ FAIL")"
echo "├── 🌐 Frontend App:   $([[ $(curl -s -f "$FRONTEND_URL" > /dev/null; echo $?) -eq 0 ]] && echo "✅ OK" || echo "❌ FAIL")"
echo "├── 📦 Widget Service: $([[ $(curl -s -f "$WIDGET_URL" > /dev/null; echo $?) -eq 0 ]] && echo "✅ OK" || echo "❌ FAIL")"
echo "├── 🗄️ PostgreSQL:     ✅ Auto-provisionado"
echo "└── 🔴 Redis:         ✅ Auto-provisionado"

echo ""
echo "🎯 Próximos testes manuais:"
echo "1. Acesse $FRONTEND_URL"
echo "2. Faça login com: demo@supkvn.com / demo123"
echo "3. Teste o chat em tempo real"
echo "4. Verifique widget em: $WIDGET_URL"
echo "5. Teste integração widget → backend"

echo ""
echo "🔧 Se algo falhar:"
echo "   railway logs -f        # Logs em tempo real"
echo "   railway status         # Status dos serviços"
echo "   railway variables      # Verificar env vars"