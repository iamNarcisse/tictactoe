import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boards } from './board.entity';
import { CreateBoardParams } from './dto/create';
import { EventsGateway } from '@src/event/event.gateway';
import { JoinBoardParams } from './dto/join';
import { initRedis } from '@src/config/redis';
import { Redis } from '@upstash/redis';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  private readonly redis: Redis;
  constructor(
    @InjectRepository(Boards)
    private readonly repo: Repository<Boards>,
    private readonly socketSrv: EventsGateway,
  ) {
    this.redis = initRedis();
  }

  async createBoard(params: CreateBoardParams) {
    try {
      const response = await this.repo.save(params);
      return response;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async joinBoard(params: JoinBoardParams) {
    try {
      const room = params.room;
      let result: any;
      try {
        result = await this.redis.hget('rooms', room);
      } catch (error) {
        // console.error(error);
        throw new BadRequestException('Invalid coode');
      }

      console.log(result);

      if (!result) {
        throw new BadRequestException('Provided code does not exist');
      }

      // console.log('Players', players);
      if (result.isRoomFull) {
        throw new UnprocessableEntityException('Max number of players reached');
      }

      return { room };
    } catch (err) {
      throw err;
    }
  }
}
