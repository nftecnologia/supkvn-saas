import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../../services/api';
import { KnowledgeBase } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import KnowledgeModal from './components/KnowledgeModal';
import toast from 'react-hot-toast';

const Knowledge: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const queryClient = useQueryClient();

  // Mock client ID - in real app this would come from user context
  const clientId = 'demo-client';

  // Fetch knowledge base
  const { data: knowledgeData, isLoading } = useQuery({
    queryKey: ['knowledge', clientId, searchTerm],
    queryFn: () => ApiService.getKnowledge(clientId, { page: 1, limit: 50 }),
  });

  // Delete knowledge mutation
  const deleteKnowledgeMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteKnowledge(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('Conhecimento removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover conhecimento');
    },
  });

  const handleAddNew = () => {
    setEditingKnowledge(null);
    setIsModalOpen(true);
  };

  const handleEdit = (knowledge: KnowledgeBase) => {
    setEditingKnowledge(knowledge);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este conhecimento?')) {
      deleteKnowledgeMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKnowledge(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FAQ':
        return '❓';
      case 'DOCUMENT':
        return '📄';
      case 'TEXT':
        return '📝';
      case 'URL':
        return '🔗';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FAQ':
        return 'bg-blue-100 text-blue-800';
      case 'DOCUMENT':
        return 'bg-green-100 text-green-800';
      case 'TEXT':
        return 'bg-purple-100 text-purple-800';
      case 'URL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter knowledge based on search term
  const filteredKnowledge = knowledgeData?.knowledge?.filter((item: KnowledgeBase) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o conhecimento que sua IA usa para responder perguntas
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Adicionar Conhecimento</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar conhecimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
              <span className="text-lg">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {knowledgeData?.knowledge?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-700">
              <span className="text-lg">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {knowledgeData?.knowledge?.filter((k: KnowledgeBase) => k.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-700">
              <span className="text-lg">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">IA Treinada</p>
              <p className="text-2xl font-bold text-gray-900">
                {knowledgeData?.knowledge?.length > 0 ? 'Sim' : 'Não'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge list */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {filteredKnowledge.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum conhecimento adicionado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Tente ajustar sua busca ou adicionar novo conteúdo'
                : 'Adicione conhecimento para treinar sua IA e melhorar as respostas automáticas'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar primeiro conhecimento
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredKnowledge.map((knowledge: KnowledgeBase) => (
              <div key={knowledge.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getTypeIcon(knowledge.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {knowledge.title}
                      </h3>
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${getTypeColor(knowledge.type)}
                      `}>
                        {knowledge.type}
                      </span>
                      {!knowledge.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {knowledge.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Criado em {new Date(knowledge.createdAt).toLocaleDateString()}</span>
                      {knowledge.source && (
                        <span>Fonte: {knowledge.source}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(knowledge)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(knowledge.id)}
                      disabled={deleteKnowledgeMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Modal */}
      {isModalOpen && (
        <KnowledgeModal
          knowledge={editingKnowledge}
          clientId={clientId}
          onClose={handleModalClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['knowledge'] });
            handleModalClose();
          }}
        />
      )}
    </div>
  );
};

export default Knowledge;