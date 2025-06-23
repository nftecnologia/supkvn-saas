import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaperAirplaneIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ApiService } from '../../../services/api';
import { Message } from '../../../types';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';

interface ChatWindowProps {
  conversationId: string;
  clientId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, clientId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => ApiService.getConversation(conversationId, clientId),
  });

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => ApiService.getMessages(conversationId),
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => ApiService.sendMessage(conversationId, messageData),
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      content: newMessage,
      sender: 'AGENT',
      senderName: 'Agente',
      type: 'TEXT',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'USER':
        return 'bg-gray-100 text-gray-900';
      case 'AGENT':
        return 'bg-blue-600 text-white';
      case 'AI':
        return 'bg-green-600 text-white';
      case 'SYSTEM':
        return 'bg-yellow-100 text-yellow-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getMessageAlignment = (sender: string) => {
    return sender === 'USER' ? 'justify-start' : 'justify-end';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const messages = messagesData?.messages || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {conversation?.subject || 'Conversa'}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation?.status === 'OPEN' && 'Conversa ativa'}
              {conversation?.status === 'IN_PROGRESS' && 'Em andamento'}
              {conversation?.status === 'CLOSED' && 'Conversa fechada'}
            </p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm mt-1">Inicie a conversa enviando uma mensagem.</p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${getMessageAlignment(message.sender)}`}
            >
              <div className="max-w-xs lg:max-w-md">
                <div className={`rounded-lg px-4 py-2 ${getSenderColor(message.sender)}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                  <span>{message.senderName || message.sender}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  {message.isFromAI && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">IA</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessageMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {/* Quick actions */}
        <div className="mt-2 flex space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
            Transferir para IA
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
            Fechar conversa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;