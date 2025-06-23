export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'CHAT' | 'EMAIL';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
  subject?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    domain?: string;
  };
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO' | 'VIDEO';
  sender: 'USER' | 'AGENT' | 'AI' | 'SYSTEM';
  senderName?: string;
  senderEmail?: string;
  isFromAI: boolean;
  attachments?: any;
  metadata?: any;
  createdAt: string;
  conversationId: string;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  htmlBody?: string;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  toName?: string;
  ccEmails: string[];
  bccEmails: string[];
  status: 'RECEIVED' | 'READ' | 'REPLIED' | 'FORWARDED' | 'ARCHIVED' | 'DELETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: any;
  messageId?: string;
  threadId?: string;
  inReplyTo?: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  type: 'FAQ' | 'DOCUMENT' | 'TEXT' | 'URL';
  source?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  fileId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ConversationStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  todayCount: number;
}

export interface EmailStats {
  total: number;
  unread: number;
  replied: number;
  archived: number;
  todayCount: number;
}

export interface AIResponse {
  message: string;
  confidence: number;
  sourceKnowledge?: string[];
}