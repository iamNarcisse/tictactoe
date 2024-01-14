import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { redis } from '@src/config/redis';
import { RoomRedisParams } from '@src/types';
import { generateRoom } from '@src/util';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BoardAccess } from './board-access.entity';
import { Boards } from './board.entity';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Boards)
    private readonly repo: Repository<Boards>,

    @InjectRepository(BoardAccess)
    private readonly accessRepo: Repository<BoardAccess>,
  ) {}

  async createBoard(params: CreateBoardParams) {
    try {
      const room = generateRoom();
      const boardID = uuidv4();
      const sessionID = uuidv4(); // used in place of user id. Since authentication is not yet ready

      params.user_id = sessionID;
      // console.log(params, 'PARAM OOOOO =>');

      const accessPayload = {
        board_id: boardID,
        user_id: sessionID,
        role: 'owner',
      };

      const payload = {
        short_code: room,
        user_id: sessionID,
        id: boardID,
        board_access: [accessPayload],
      };

      await this.repo.save(payload);

      const roomRedisParams: RoomRedisParams = {
        creator: sessionID,
        players: [sessionID],
        isRoomFull: false,
        boardID: boardID,
      };

      await redis.hset('rooms', {
        [room]: JSON.stringify(roomRedisParams),
      });

      return {
        room,
        sessionID,
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async joinBoard(params: JoinBoardParams) {
    try {
      const room = params.room;
      let result: any;
      try {
        result = await redis.hget('rooms', room);
      } catch (error) {
        // console.error(error);
        throw new BadRequestException('Invalid coode');
      }

      if (!result) {
        throw new BadRequestException('Provided code does not exist');
      }

      const redisData = JSON.parse(result as string) as RoomRedisParams;

      if (redisData.isRoomFull) {
        throw new UnprocessableEntityException('Max number of players reached');
      }

      const sessionID = uuidv4(); // used in place of user id. Since authentication is not yet ready

      const payload = {
        board_id: redisData.boardID,
        role: 'collaborator',
        user_id: sessionID,
      };

      await this.accessRepo.save(payload);

      const oldPlayers = redisData.players;
      const currentPlayers: string[] = [...oldPlayers, sessionID];

      const roomRedisParams: RoomRedisParams = {
        ...redisData,
        players: currentPlayers,
        isRoomFull: true,
      };

      await redis.hset('rooms', {
        [room]: JSON.stringify(roomRedisParams),
      });

      return { room, sessionID };
    } catch (err) {
      throw err;
    }
  }
}
