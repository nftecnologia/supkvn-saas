#!/bin/bash

echo "📁 Reestruturando para Microserviços"
echo "===================================="

# Criar estrutura apps/
echo "1. Criando estrutura apps/..."
mkdir -p apps packages

# Verificar se já foi reestruturado
if [ -d "apps/backend" ]; then
    echo "✅ Já reestruturado"
    exit 0
fi

# Mover backend
echo "2. Movendo backend..."
if [ -d "backend" ]; then
    mv backend apps/
    echo "✅ Backend movido para apps/backend"
fi

# Mover frontend  
echo "3. Movendo frontend..."
if [ -d "frontend" ]; then
    mv frontend apps/
    echo "✅ Frontend movido para apps/frontend"
fi

# Mover widget
echo "4. Movendo widget..."
if [ -d "widget" ]; then
    mv widget apps/
    echo "✅ Widget movido para apps/widget"
fi

# Criar package database compartilhado
echo "5. Criando packages compartilhados..."
mkdir -p packages/database packages/types

# Mover Prisma para package compartilhado
if [ -d "apps/backend/prisma" ]; then
    cp -r apps/backend/prisma/* packages/database/
    echo "✅ Database schema compartilhado criado"
fi

# Criar railway.json para cada app
echo "6. Criando configurações Railway..."

# Backend railway.json
cat > apps/backend/railway.json << 'EOF'
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

# Widget railway.json  
cat > apps/widget/railway.json << 'EOF'
{
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckTimeout": 300
  },
  "build": {
    "builder": "nixpacks", 
    "buildCommand": "npm run build"
  }
}
EOF

echo ""
echo "✅ Reestruturação concluída!"
echo ""
echo "📁 Nova estrutura:"
echo "├── apps/"
echo "│   ├── backend/     # API Node.js"
echo "│   ├── frontend/    # React App"
echo "│   └── widget/      # Widget embedável"
echo "├── packages/"
echo "│   ├── database/    # Prisma shared"
echo "│   └── types/       # Types shared"
echo "└── railway.json     # Config principal"
echo ""
echo "🚀 Agora você pode:"
echo "1. Deploy backend: apps/backend/"
echo "2. Deploy widget: apps/widget/"
echo "3. Frontend no Vercel: apps/frontend/"