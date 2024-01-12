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
import { redis } from '@src/config/redis';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(
    @InjectRepository(Boards)
    private readonly repo: Repository<Boards>,
    private readonly socketSrv: EventsGateway,
  ) {}

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

      const result: any = await redis.hget('rooms', room);

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
