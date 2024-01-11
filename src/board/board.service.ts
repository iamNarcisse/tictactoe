import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boards } from './board.entity';
import { CreateBoardParams } from './dto/create';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(
    @InjectRepository(Boards)
    private readonly repo: Repository<Boards>,
  ) {}

  async createBoard(params: CreateBoardParams) {
    try {
      const response = await this.repo.save(params);
      return response;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
