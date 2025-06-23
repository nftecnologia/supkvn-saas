import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';
import { ApiService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard: React.FC = () => {
  // Mock client ID - in real app this would come from user context
  const clientId = 'demo-client';

  // Fetch conversation stats
  const { data: conversationStats, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversation-stats', clientId],
    queryFn: () => ApiService.getConversationStats(clientId),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Stats cards data
  const statsCards = [
    {
      title: 'Conversas Hoje',
      value: conversationStats?.todayCount || 0,
      change: '+12%',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue',
    },
    {
      title: 'Total de Conversas',
      value: conversationStats?.total || 0,
      change: '+8%',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'green',
    },
    {
      title: 'Em Andamento',
      value: conversationStats?.inProgress || 0,
      change: '-2%',
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      title: 'E-mails',
      value: 0, // TODO: Implement email stats
      change: '0%',
      changeType: 'neutral' as const,
      icon: EnvelopeIcon,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      green: 'bg-green-50 text-green-700 ring-green-600/20',
      yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do seu atendimento ao cliente
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`rounded-lg p-3 ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' && (
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              )}
              {stat.changeType === 'decrease' && (
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : stat.changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. mês passado</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Conversas Recentes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">U</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Cliente {i}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Preciso de ajuda com minha conta...
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {i}h atrás
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Ver todas as conversas →
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Nova Conversa
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Gerenciar IA
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Configurar E-mail
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance chart placeholder */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance dos Últimos 7 Dias</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Gráfico em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;