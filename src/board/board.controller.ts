import { Body, Controller, Post } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';

@Controller('board')
export class BoardController {
  constructor(private readonly service: BoardService) {}
  @Post()
  async createBoard(@Body() params: CreateBoardParams) {
    const resource = await this.service.createBoard(params);
    return resource;
  }

  @Post('join')
  async joinBoard(@Body() params: JoinBoardParams) {
    const resource = await this.service.joinBoard(params);
    return resource;
  }
}
