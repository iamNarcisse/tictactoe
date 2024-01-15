import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { redis } from '@src/config/redis';
import { PlayerRole, RedisKey, RoomRedisParams } from '@src/types';
import { generateRoom } from '@src/util';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BoardAccess } from './board-access.entity';
import { Boards } from './board.entity';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';
import { PatchBoardParams } from './dto/patch';

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
        role: PlayerRole.OWNER,
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

      await redis.hset(RedisKey.ROOMS, {
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
        result = await redis.hget(RedisKey.ROOMS, room);
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
        role: PlayerRole.COLLABORATOR,
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

      await redis.hset(RedisKey.ROOMS, {
        [room]: JSON.stringify(roomRedisParams),
      });

      return { room, sessionID };
    } catch (err) {
      throw err;
    }
  }

  async updateBoard(params: PatchBoardParams) {
    try {
      const room = params.code;
      const sessionID = params.sessionID;

      let result: any;
      try {
        result = await redis.hget(RedisKey.ROOMS, room);
      } catch (error) {
        // console.error(error);
        throw new BadRequestException('Invalid coode');
      }

      if (!result) {
        throw new BadRequestException('Provided code does not exist');
      }

      const redisData = JSON.parse(result as string) as RoomRedisParams;

      if (!redisData.players.includes(sessionID)) {
        throw new BadRequestException(
          'You are not allowed to to perform this operation',
        );
      }

      if (redisData.creator !== params.sessionID) {
        // Do nothing
        return {};
      }

      const getWinnerID = (symbol?: string): string | undefined => {
        if (!symbol) return undefined;

        if (symbol.toLocaleLowerCase() === 'x') {
          return redisData.creator;
        }

        const id = redisData.players.find((id) => id === sessionID);
        return id;
      };

      const updatePayload: Partial<Boards> = {
        status: params.status,
        winner_id: getWinnerID(params.winner_symbol),
      };

      await this.repo.update({ short_code: room }, updatePayload);

      return { room, sessionID };
    } catch (err) {
      throw err;
    }
  }
}
