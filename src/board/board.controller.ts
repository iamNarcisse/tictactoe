import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BoardService } from './board.service';
import { CreateBoardParams } from './dto/create';

@Controller('board')
export class BoardController {
  constructor(private readonly service: BoardService) {}
  @Post()
  async addBank(
    @Body() params: CreateBoardParams,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resource = await this.service.createBoard(params);
    return res.status(HttpStatus.OK).json(resource);
  }
}
