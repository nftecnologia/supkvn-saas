import OpenAI from 'openai';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { KnowledgeType } from '@prisma/client';

export interface AIResponse {
  message: string;
  confidence: number;
  sourceKnowledge?: string[];
}

export interface KnowledgeItem {
  title: string;
  content: string;
  type: KnowledgeType;
  source?: string;
}

class AIService {
  private openai: OpenAI;
  private systemPrompt = `Você é um assistente de atendimento ao cliente inteligente e prestativo. 

Suas responsabilidades:
1. Responder perguntas dos clientes com base no conhecimento fornecido
2. Ser cordial, profissional e útil
3. Se não souber a resposta, admitir e sugerir entrar em contato com um agente humano
4. Manter respostas concisas mas completas
5. Usar um tom amigável e profissional

Instruções importantes:
- Sempre priorize a informação da base de conhecimento do cliente
- Se a pergunta não estiver relacionada à base de conhecimento, responda de forma geral mas sugira falar com um agente
- Mantenha as respostas em português brasileiro
- Seja direto e objetivo, mas sempre educado`;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured');
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    message: string, 
    clientId: string, 
    conversationHistory?: string[]
  ): Promise<AIResponse> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI not configured');
      }

      // Get client's knowledge base
      const knowledgeBase = await this.getClientKnowledge(clientId);
      
      // Prepare context with knowledge base
      const knowledgeContext = knowledgeBase.map(kb => 
        `${kb.title}: ${kb.content}`
      ).join('\n\n');

      // Prepare conversation history
      const historyContext = conversationHistory?.slice(-10).join('\n') || '';

      // Create the prompt
      const prompt = `
${this.systemPrompt}

Base de Conhecimento:
${knowledgeContext}

Histórico da conversa:
${historyContext}

Pergunta do cliente: ${message}

Resposta:`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: `Base de Conhecimento:\n${knowledgeContext}\n\nPergunta: ${message}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Calculate confidence based on whether knowledge base was used
      const confidence = knowledgeContext.length > 0 ? 0.8 : 0.6;

      // Find relevant knowledge sources
      const sourceKnowledge = this.findRelevantSources(message, knowledgeBase);

      logger.info(`AI response generated for client ${clientId}`);
      
      return {
        message: response,
        confidence,
        sourceKnowledge: sourceKnowledge.map(kb => kb.title),
      };
    } catch (error) {
      logger.error('Failed to generate AI response:', error);
      
      // Fallback response
      return {
        message: 'Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, aguarde que um de nossos agentes irá atendê-lo em breve.',
        confidence: 0.1,
      };
    }
  }

  async addKnowledge(clientId: string, knowledge: KnowledgeItem): Promise<any> {
    try {
      // Generate embeddings for better search (optional)
      // const embeddings = await this.generateEmbeddings(knowledge.content);

      const savedKnowledge = await prisma.knowledgeBase.create({
        data: {
          title: knowledge.title,
          content: knowledge.content,
          type: knowledge.type,
          source: knowledge.source,
          clientId,
          // vectorData: embeddings, // For future vector search implementation
        },
      });

      logger.info(`Knowledge added for client ${clientId}: ${knowledge.title}`);
      return savedKnowledge;
    } catch (error) {
      logger.error('Failed to add knowledge:', error);
      throw error;
    }
  }

  async getClientKnowledge(clientId: string): Promise<any[]> {
    try {
      const knowledge = await prisma.knowledgeBase.findMany({
        where: {
          clientId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return knowledge;
    } catch (error) {
      logger.error('Failed to get client knowledge:', error);
      return [];
    }
  }

  async updateKnowledge(id: string, clientId: string, updates: Partial<KnowledgeItem>): Promise<any> {
    try {
      const knowledge = await prisma.knowledgeBase.update({
        where: {
          id,
          clientId,
        },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.type && { type: updates.type }),
          ...(updates.source && { source: updates.source }),
          updatedAt: new Date(),
        },
      });

      logger.info(`Knowledge updated: ${id}`);
      return knowledge;
    } catch (error) {
      logger.error('Failed to update knowledge:', error);
      throw error;
    }
  }

  async deleteKnowledge(id: string, clientId: string): Promise<void> {
    try {
      await prisma.knowledgeBase.update({
        where: {
          id,
          clientId,
        },
        data: {
          isActive: false,
        },
      });

      logger.info(`Knowledge deactivated: ${id}`);
    } catch (error) {
      logger.error('Failed to delete knowledge:', error);
      throw error;
    }
  }

  async analyzeConversation(messages: string[]): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    summary: string;
  }> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI not configured');
      }

      const conversation = messages.join('\n');
      
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analise a conversa e retorne um JSON com: sentiment (positive/neutral/negative), topics (array de tópicos principais), e summary (resumo em uma frase).'
          },
          {
            role: 'user',
            content: conversation
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No analysis response from AI');
      }

      try {
        return JSON.parse(response);
      } catch {
        // Fallback if JSON parsing fails
        return {
          sentiment: 'neutral' as const,
          topics: ['atendimento'],
          summary: 'Conversa analisada',
        };
      }
    } catch (error) {
      logger.error('Failed to analyze conversation:', error);
      
      return {
        sentiment: 'neutral' as const,
        topics: [],
        summary: 'Análise não disponível',
      };
    }
  }

  private findRelevantSources(message: string, knowledgeBase: any[]): any[] {
    // Simple keyword matching - could be improved with embeddings/vector search
    const messageLower = message.toLowerCase();
    const relevantSources = knowledgeBase.filter(kb => {
      const titleLower = kb.title.toLowerCase();
      const contentLower = kb.content.toLowerCase();
      
      return titleLower.includes(messageLower) || 
             contentLower.includes(messageLower) ||
             messageLower.includes(titleLower);
    });

    return relevantSources.slice(0, 3); // Return top 3 relevant sources
  }

  // Future implementation for vector embeddings
  // private async generateEmbeddings(text: string): Promise<number[]> {
  //   try {
  //     const response = await this.openai.embeddings.create({
  //       model: 'text-embedding-ada-002',
  //       input: text,
  //     });
  //     
  //     return response.data[0].embedding;
  //   } catch (error) {
  //     logger.error('Failed to generate embeddings:', error);
  //     return [];
  //   }
  // }
}

export const aiService = new AIService();