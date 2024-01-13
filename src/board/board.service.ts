import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { redis } from '@src/config/redis';
import { EventsGateway } from '@src/event/event.gateway';
import { Repository } from 'typeorm';
import { Boards } from './board.entity';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';

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

      const data = JSON.parse(result as string);

      console.log('data', data);
      if (data.isRoomFull) {
        throw new UnprocessableEntityException('Max number of players reached');
      }

      return { room };
    } catch (err) {
      throw err;
    }
  }
}
