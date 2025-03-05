import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CacheService } from '../../cache/cache.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(EventsGateway.name);

  constructor(
    @Inject(CacheService) private cacheService: CacheService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('login')
  async handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (!message.token) return;

    try {
      const payload = this.jwtService.verify(message.token);
      console.log('🚀 ~ EventsGateway ~ payload:', payload);

      if (payload) {
        await this.cacheService.setCached(
          `user:${payload.userId}:socketId`,
          client.id,
        );

        client.emit('login', 'Login success');
        this.logger.log(`Client authorized: ${client.id}`);
      }
    } catch (error) {
      client.emit('error', { message: 'Unauthorized', details: error.message });
      this.logger.error(`Client unauthorized: ${error.message}`);
    }
  }

  async sendMessageToUser(userId: string, message: string) {
    const socketId = await this.cacheService.getCached(
      `user:${userId}:socketId`,
    );
    if (socketId) {
      this.server.to(socketId as any).emit('receive_message', message);
    } else {
      this.logger.warn(`User ${userId} is not connected`);
    }
  }
}
