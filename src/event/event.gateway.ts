import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { redis } from '@src/config/redis';
import { RoomRedisParams } from '@src/types';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  sids: Map<string, string>;

  constructor() {
    this.sids = new Map();
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log(data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { sessionID: string; room: string },
  ): Promise<WsResponse<unknown>> {
    const room = data.room;
    const socketID = socket.id;
    const sessionID = data.sessionID;

    if (!room || !sessionID) {
      throw new WsException('You are not allowed to to perform this operation');
    }

    // console.log('SESSION DATA', data);

    const payload = {
      socketID,
      room,
      sessionID,
    };

    try {
      this.sids.set(socketID, room);
      socket.join(room);
      this.server.in(room).emit('roomCreated', payload);
    } catch (error) {
      throw error;
    }

    return undefined;
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { room: string; sessionID: string },
  ): Promise<WsResponse<unknown>> {
    try {
      const room = data.room;
      const socketID = socket.id;

      this.sids.set(socketID, data.room);
      socket.join(data.room);

      const payload = {
        room: data.room,
        socketID: socketID,
        guestSocketID: socketID,
        sessionID: data.sessionID,
      };

      // Retrieve room information from cache
      const result: any = await redis.hget('rooms', room);

      if (!result) {
        throw new WsException('Provided code does not exist');
      }

      const redisData = JSON.parse(result as string) as RoomRedisParams;

      const players = redisData.players;

      // Extra check to make sure
      if (!players.includes(data.sessionID)) {
        throw new WsException('You are not allowed to connect to this board');
      }

      this.server.in(data.room).emit('roomateJoined', payload);
    } catch (error) {
      throw new WsException('Provided code does not exist');
    }

    return undefined;
  }

  @SubscribeMessage('playRoom')
  roommatePlay(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): WsResponse<unknown> {
    const socketID = socket.id;
    const room = this.sids.get(socketID);
    this.server.in(room).emit('roomatePlayed', data);
    return undefined;
  }
}
