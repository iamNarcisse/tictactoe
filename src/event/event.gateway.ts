import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { initRedis } from '@src/config/redis';
import { generateRoom } from '@src/util';
import { Redis } from '@upstash/redis';
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

  redis: Redis;
  constructor() {
    this.sids = new Map();
    this.redis = initRedis();
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
    @MessageBody() data: any,
  ): Promise<WsResponse<unknown>> {
    const room = generateRoom();
    const socketID = socket.id;
    const payload = {
      socketID,
      room,
    };

    try {
      console.log(data);
      await this.redis.hset('rooms', {
        [room]: JSON.stringify({
          creator: socketID,
          players: [socketID],
          isRoomFull: false,
        }),
      });
      this.sids.set(socketID, room);
      socket.join(room);
      this.server.in(room).emit('roomCreated', payload);
    } catch (error) {
      throw new WsException('Provided code does not exist');
    }

    return undefined;
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { room: string },
  ): Promise<WsResponse<unknown>> {
    const room = data.room;
    const socketID = socket.id;
    socket.join(data.room);

    const payload = {
      room: data.room,
      socketID: socketID,
      guestSocketID: socketID,
    };

    try {
      console.log(data, 'DATA FROM USER');

      // Retrieve room information from cache
      const result: any = await this.redis.hget('rooms', room);

      if (!result) {
        throw new WsException('Provided code does not exist');
      }

      console.log(result?.creator, 'Creator is here');

      const players = result.players;

      await this.redis.hset('rooms', {
        [room]: JSON.stringify({
          ...result,
          players: players.push(socketID),
          isRoomFull: true,
        }),
      });

      this.server.in(data.room).emit('roomateJoined', payload);

      this.sids.set(socketID, data.room);
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
