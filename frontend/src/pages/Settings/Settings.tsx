import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CogIcon, 
  GlobeAltIcon, 
  AcademicCapIcon, 
  EnvelopeIcon,
  KeyIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Geral', icon: CogIcon },
    { id: 'widget', name: 'Widget', icon: CodeBracketIcon },
    { id: 'ai', name: 'Inteligência Artificial', icon: AcademicCapIcon },
    { id: 'email', name: 'E-mail', icon: EnvelopeIcon },
    { id: 'api', name: 'API', icon: KeyIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie as configurações do seu sistema de atendimento
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'widget' && <WidgetSettings />}
        {activeTab === 'ai' && <AISettings />}
        {activeTab === 'email' && <EmailSettings />}
        {activeTab === 'api' && <APISettings />}
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings: React.FC = () => {
  const schema = z.object({
    companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
    timezone: z.string().min(1, 'Fuso horário é obrigatório'),
    language: z.string().min(1, 'Idioma é obrigatório'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: 'Demo Company',
      website: 'https://demo.com',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    },
  });

  const onSubmit = (data: any) => {
    toast.success('Configurações salvas com sucesso!');
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              {...register('companyName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              {...register('website')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://seusite.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/London">London (UTC+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};

// Widget Settings Component
const WidgetSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Widget</h3>
        
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Widget Ativo</h4>
              <p className="text-sm text-gray-500">Ativar/desativar o widget de chat no seu site</p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {/* Appearance */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Aparência</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="bottom-right">Inferior Direita</option>
                  <option value="bottom-left">Inferior Esquerda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
                <input
                  type="color"
                  defaultValue="#3b82f6"
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Código de Incorporação</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-800 block">
                {`<script src="http://localhost:3001/widget.js"></script>
<script>
  initSupkvnWidget({
    apiUrl: 'http://localhost:3000',
    clientId: 'demo-client',
    position: 'bottom-right',
    primaryColor: '#3b82f6'
  });
</script>`}
              </code>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Copie e cole este código antes da tag &lt;/body&gt; do seu site
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Settings Component
const AISettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações da IA</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo de IA
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recomendado)</option>
              <option value="gpt-4">GPT-4 (Mais preciso)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personalidade da IA
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva como a IA deve se comportar e responder..."
              defaultValue="Seja cordial, profissional e prestativo. Responda de forma clara e objetiva, sempre oferecendo ajuda adicional quando necessário."
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Status da IA</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✅ Modelo configurado: GPT-3.5 Turbo</p>
              <p>✅ Base de conhecimento: 1 item(s) carregado(s)</p>
              <p>✅ Última atualização: Agora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Settings Component
const EmailSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de E-mail</h3>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">🚧 Em Desenvolvimento</h4>
            <p className="text-sm text-yellow-800">
              A integração de e-mail ainda está em desenvolvimento. Em breve você poderá:
            </p>
            <ul className="mt-2 text-sm text-yellow-800 space-y-1">
              <li>• Conectar sua conta de e-mail (Gmail, Outlook, etc.)</li>
              <li>• Receber e responder e-mails automaticamente</li>
              <li>• Integrar com a IA para respostas automáticas</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servidor SMTP
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="smtp.gmail.com"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porta
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="587"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// API Settings Component
const APISettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações da API</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Chave da API</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value="sk-demo-1234567890abcdef"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Copiar
              </button>
              <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Regenerar
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Use esta chave para acessar a API do SupKVN
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Webhooks</h4>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://seusite.com/webhook"
            />
            <p className="mt-2 text-sm text-gray-500">
              URL para receber notificações de eventos (opcional)
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Documentação da API</h4>
            <p className="text-sm text-gray-600 mb-3">
              Acesse nossa documentação completa para integrar com a API do SupKVN
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-500">
              Ver Documentação →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;