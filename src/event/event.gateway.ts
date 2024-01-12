import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { generateRoom } from '@src/util';
// import { redis } from '@src/config/redis';
import { from, Observable } from 'rxjs';
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

  @SubscribeMessage('foo')
  async identity(@MessageBody() data: any): Promise<any> {
    return data;
  }

  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): WsResponse<unknown> {
    const room = generateRoom();
    const socketID = socket.id;
    const payload = {
      socketID,
      room,
    };

    console.log(data);

    this.sids.set(socketID, room);
    // await redis.hset('people', { name: 'joe' });
    socket.join(room);

    this.server.in(room).emit('roomCreated', payload);
    return undefined;
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { room: string },
  ): WsResponse<unknown> {
    const socketID = socket.id;

    socket.join(data.room);
    const payload = {
      room: data.room,
      socketID: socketID,
      guestSocketID: socketID,
    };

    this.server.in(data.room).emit('roomateJoined', payload);

    this.sids.set(socketID, data.room);
    return undefined;
  }

  @SubscribeMessage('playRoom')
  roommatePlay(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): WsResponse<unknown> {
    // console.log('playRoom', data);
    const socketID = socket.id;
    const room = this.sids.get(socketID);
    this.server.in(room).emit('roomatePlayed', data);
    return undefined;
  }
}
