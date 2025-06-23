import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../../services/api';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Chat: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock client ID - in real app this would come from user context
  const clientId = 'demo-client';

  // Fetch conversations
  const { data: conversationsData, isLoading, refetch } = useQuery({
    queryKey: ['conversations', clientId, searchTerm],
    queryFn: () => ApiService.getConversations(clientId, { 
      page: 1, 
      limit: 50, 
      search: searchTerm 
    }),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const handleNewConversation = async () => {
    try {
      const newConversation = await ApiService.createConversation({
        type: 'CHAT',
        subject: 'Nova conversa',
        clientId,
      });
      setSelectedConversationId(newConversation.conversation.id);
      refetch(); // Refresh the conversation list
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Left sidebar - Conversation list */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
            <button
              onClick={handleNewConversation}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm">Nova</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversationsData?.conversations || []}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>
      </div>

      {/* Right side - Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow 
            conversationId={selectedConversationId}
            clientId={clientId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500 mb-4">
                Escolha uma conversa existente ou crie uma nova para começar
              </p>
              <button
                onClick={handleNewConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar nova conversa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;