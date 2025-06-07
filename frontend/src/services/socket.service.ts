import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userData?: { userId?: string; username?: string }) {
    if (this.socket?.connected) return this.socket;

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventHandlers();

    // Kullanıcı online durumunu bildir
    if (userData) {
      this.socket.emit('user-online', userData);
    }

    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });
  }

  // Online kullanıcıları dinle
  onOnlineUsers(callback: (data: { count: number; users: any[] }) => void) {
    this.socket?.on('online-users', callback);
  }

  // Mesaj dinle
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new-message', callback);
  }

  // Sanat beğeni güncellemelerini dinle
  onArtLikeUpdate(callback: (data: any) => void) {
    this.socket?.on('art-like-update', callback);
  }

  // Mesaj gönder
  sendMessage(message: string, username: string) {
    this.socket?.emit('send-message', { message, username });
  }

  // Sanat beğenisi bildir
  emitArtLike(artId: string, likesCount: number, username: string) {
    this.socket?.emit('art-liked', { artId, likesCount, username });
  }

  // Bağlantıyı kapat
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Socket instance'ını al
  getSocket() {
    return this.socket;
  }

  // Bağlantı durumunu kontrol et
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const socketManager = new SocketManager();
export default socketManager;
