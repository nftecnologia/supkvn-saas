import { io, Socket } from 'socket.io-client';

interface WidgetConfig {
  apiUrl: string;
  clientId: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  title?: string;
}

class SupkvnWidget {
  private socket: Socket;
  private config: WidgetConfig;
  private isOpen = false;
  private container: HTMLElement;
  private chatContainer: HTMLElement;

  constructor(config: WidgetConfig) {
    this.config = {
      position: 'bottom-right',
      primaryColor: '#3b82f6',
      title: 'Atendimento',
      ...config
    };

    this.socket = io(this.config.apiUrl);
    this.init();
  }

  private init() {
    this.createWidget();
    this.setupEventListeners();
  }

  private createWidget() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'supkvn-widget';
    this.container.style.cssText = `
      position: fixed;
      ${this.config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create chat button
    const button = document.createElement('button');
    button.innerHTML = '💬';
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${this.config.primaryColor};
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      this.toggleChat();
    });

    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.style.cssText = `
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    this.createChatInterface();

    this.container.appendChild(button);
    this.container.appendChild(this.chatContainer);
    document.body.appendChild(this.container);
  }

  private createChatInterface() {
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: ${this.config.primaryColor};
      color: white;
      padding: 16px;
      font-weight: 600;
    `;
    header.textContent = this.config.title || 'Atendimento';

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'messages';
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `;

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
      display: flex;
      gap: 8px;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Digite sua mensagem...';
    input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Enviar';
    sendButton.style.cssText = `
      padding: 8px 16px;
      background: ${this.config.primaryColor};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;

    sendButton.addEventListener('click', () => {
      this.sendMessage(input.value);
      input.value = '';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage(input.value);
        input.value = '';
      }
    });

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);

    this.chatContainer.appendChild(header);
    this.chatContainer.appendChild(messagesContainer);
    this.chatContainer.appendChild(inputContainer);
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatContainer.style.display = this.isOpen ? 'flex' : 'none';
  }

  private sendMessage(message: string) {
    if (!message.trim()) return;

    this.addMessage(message, 'user');
    
    this.socket.emit('chat_message', {
      clientId: this.config.clientId,
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  private addMessage(message: string, sender: 'user' | 'bot') {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
      ${sender === 'user' 
        ? `background: ${this.config.primaryColor}; color: white; margin-left: auto;`
        : 'background: white; color: #374151;'
      }
    `;
    messageDiv.textContent = message;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private setupEventListeners() {
    this.socket.on('chat_response', (data) => {
      this.addMessage(data.message, 'bot');
    });

    this.socket.on('connect', () => {
      console.log('Widget connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Widget disconnected from server');
    });
  }
}

// Global function to initialize widget
(window as any).initSupkvnWidget = function(config: WidgetConfig) {
  return new SupkvnWidget(config);
};

export default SupkvnWidget;