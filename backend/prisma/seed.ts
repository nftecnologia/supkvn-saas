import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@supkvn.com' },
    update: {},
    create: {
      email: 'demo@supkvn.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('Created user:', user);

  // Create demo client
  const client = await prisma.client.upsert({
    where: { id: 'demo-client' },
    update: {},
    create: {
      id: 'demo-client',
      name: 'Demo Company',
      domain: 'demo.com',
      website: 'https://demo.com',
      userId: user.id,
    },
  });

  console.log('Created client:', client);

  // Create demo settings
  const settings = [
    {
      key: 'widget_enabled',
      value: 'true',
      type: 'BOOLEAN' as const,
    },
    {
      key: 'widget_position',
      value: 'bottom-right',
      type: 'STRING' as const,
    },
    {
      key: 'widget_color',
      value: '#3b82f6',
      type: 'STRING' as const,
    },
    {
      key: 'ai_enabled',
      value: 'true',
      type: 'BOOLEAN' as const,
    },
    {
      key: 'ai_model',
      value: 'gpt-3.5-turbo',
      type: 'STRING' as const,
    },
    {
      key: 'email_enabled',
      value: 'false',
      type: 'BOOLEAN' as const,
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: {
        clientId_key: {
          clientId: client.id,
          key: setting.key,
        },
      },
      update: {},
      create: {
        clientId: client.id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
      },
    });
  }

  console.log('Created settings');

  // Create demo knowledge base
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      title: 'FAQ - Como usar o sistema',
      content: 'Bem-vindo ao nosso sistema de atendimento. Aqui você pode encontrar ajuda para suas dúvidas mais comuns.',
      type: 'FAQ',
      source: 'manual',
      clientId: client.id,
    },
  });

  console.log('Created knowledge base:', knowledgeBase);

  // Create demo conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'CHAT',
      status: 'OPEN',
      subject: 'Conversa de demonstração',
      clientId: client.id,
      messages: {
        create: [
          {
            content: 'Olá! Como posso ajudar você hoje?',
            sender: 'AI',
            senderName: 'Assistente IA',
            isFromAI: true,
          },
          {
            content: 'Preciso de ajuda com minha conta',
            sender: 'USER',
            senderName: 'Cliente',
            senderEmail: 'cliente@exemplo.com',
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  console.log('Created conversation with messages:', conversation);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });