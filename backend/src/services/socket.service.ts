import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { updateOnlineUsers } from '../controllers/stats.controller';

interface OnlineUser {
  id: string;
  username?: string;
  socketId: string;
  joinedAt: Date;
}

class SocketService {
  private io: Server;
  private onlineUsers: Map<string, OnlineUser> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔗 User connected: ${socket.id}`);

      // Kullanıcı online listesine ekle
      socket.on('user-online', (userData) => {
        const user: OnlineUser = {
          id: userData?.userId || `guest-${Date.now()}`,
          username: userData?.username || 'Guest',
          socketId: socket.id,
          joinedAt: new Date()
        };

        this.onlineUsers.set(socket.id, user);
        this.broadcastOnlineUsers();
        this.updateOnlineUsersCount();
        
        console.log(`👤 User ${user.username} is now online`);
      });

      // Kullanıcı offline olduğunda
      socket.on('disconnect', () => {
        const user = this.onlineUsers.get(socket.id);
        if (user) {
          console.log(`👋 User ${user.username} disconnected`);
          this.onlineUsers.delete(socket.id);
          this.broadcastOnlineUsers();
          this.updateOnlineUsersCount();
        }
      });

      // Mesaj gönderme (genel chat için)
      socket.on('send-message', (data) => {
        socket.broadcast.emit('new-message', {
          id: Date.now(),
          message: data.message,
          username: data.username || 'Guest',
          timestamp: new Date()
        });
      });

      // Sanat beğenildiğinde real-time güncelleme
      socket.on('art-liked', (data) => {
        socket.broadcast.emit('art-like-update', {
          artId: data.artId,
          likesCount: data.likesCount,
          likedBy: data.username
        });
      });

      // İlk bağlantıda mevcut online kullanıcıları gönder
      this.sendOnlineUsersToSocket(socket);
    });
  }

  private broadcastOnlineUsers(): void {
    const users = Array.from(this.onlineUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      joinedAt: user.joinedAt
    }));

    this.io.emit('online-users', {
      count: users.length,
      users: users
    });
  }

  private sendOnlineUsersToSocket(socket: any): void {
    const users = Array.from(this.onlineUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      joinedAt: user.joinedAt
    }));

    socket.emit('online-users', {
      count: users.length,
      users: users
    });
  }

  private async updateOnlineUsersCount(): Promise<void> {
    try {
      await updateOnlineUsers(this.onlineUsers.size);
    } catch (error) {
      console.error('Failed to update online users count:', error);
    }
  }

  // Public methods
  public getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  public getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  public getIo(): Server {
    return this.io;
  }

  // Belirli bir odaya mesaj gönder
  public sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // Tüm kullanıcılara mesaj gönder
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }
}

export default SocketService;
