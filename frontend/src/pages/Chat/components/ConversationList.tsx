import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Conversation } from '../../../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'CLOSED':
        return 'Fechado';
      case 'ARCHIVED':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-red-500';
      case 'HIGH':
        return 'border-l-orange-500';
      case 'MEDIUM':
        return 'border-l-yellow-500';
      case 'LOW':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Nenhuma conversa encontrada</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        const lastMessage = conversation.messages?.[0];
        
        return (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`
              p-4 cursor-pointer transition-colors border-l-4
              ${isSelected 
                ? 'bg-blue-50 border-l-blue-500' 
                : `hover:bg-gray-50 ${getPriorityColor(conversation.priority)}`
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.subject || 'Conversa sem título'}
              </h3>
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${getStatusColor(conversation.status)}
              `}>
                {getStatusText(conversation.status)}
              </span>
            </div>
            
            {/* Last message preview */}
            {lastMessage && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-medium">
                    {lastMessage.senderName || 'Usuário'}:
                  </span>{' '}
                  {lastMessage.content}
                </p>
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                {conversation.type === 'CHAT' && (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800">
                    Chat
                  </span>
                )}
                {conversation.type === 'EMAIL' && (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800">
                    E-mail
                  </span>
                )}
                {conversation._count && (
                  <span>{conversation._count.messages} mensagens</span>
                )}
              </div>
              <span>
                {formatDistanceToNow(new Date(conversation.updatedAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;