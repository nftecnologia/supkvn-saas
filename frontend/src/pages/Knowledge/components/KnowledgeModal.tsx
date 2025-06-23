import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../../../services/api';
import { KnowledgeBase } from '../../../types';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const knowledgeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  type: z.enum(['FAQ', 'DOCUMENT', 'TEXT', 'URL']),
  source: z.string().optional(),
});

type KnowledgeFormData = z.infer<typeof knowledgeSchema>;

interface KnowledgeModalProps {
  knowledge: KnowledgeBase | null;
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  knowledge,
  clientId,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!knowledge;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      title: knowledge?.title || '',
      content: knowledge?.content || '',
      type: knowledge?.type || 'FAQ',
      source: knowledge?.source || '',
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: KnowledgeFormData) => {
      if (isEditing) {
        return ApiService.updateKnowledge(clientId, knowledge.id, data);
      } else {
        return ApiService.addKnowledge(clientId, data);
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Conhecimento atualizado!' : 'Conhecimento adicionado!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao salvar conhecimento');
    },
  });

  const onSubmit = (data: KnowledgeFormData) => {
    saveMutation.mutate(data);
  };

  const selectedType = watch('type');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Conhecimento' : 'Adicionar Conhecimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Como fazer login no sistema"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conhecimento
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FAQ">FAQ - Pergunta Frequente</option>
              <option value="TEXT">Texto - Conteúdo livre</option>
              <option value="DOCUMENT">Documento - Arquivo ou manual</option>
              <option value="URL">URL - Link externo</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              {...register('content')}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                selectedType === 'FAQ' 
                  ? "Ex: Para fazer login, acesse a página inicial e clique em 'Entrar'. Digite seu e-mail e senha cadastrados."
                  : selectedType === 'URL'
                  ? "Ex: https://exemplo.com/documentacao"
                  : "Digite o conteúdo que a IA deve conhecer para responder perguntas relacionadas."
              }
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              Fonte (opcional)
            </label>
            <input
              {...register('source')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Manual do usuário v2.1, Site oficial, etc."
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
            )}
          </div>

          {/* Help text */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para bom conteúdo:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja específico e claro nas informações</li>
              <li>• Use exemplos práticos quando possível</li>
              <li>• Inclua passos detalhados para procedimentos</li>
              <li>• Evite informações que mudam frequentemente</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saveMutation.isPending && <LoadingSpinner size="sm" />}
              <span>{isEditing ? 'Atualizar' : 'Adicionar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeModal;