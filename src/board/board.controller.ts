import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BoardService } from './board.service';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';

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

  @Post('join')
  async joinBoard(@Body() params: JoinBoardParams) {
    console.log(params, 'PARAMS');
    const resource = await this.service.joinBoard(params);
    console.log('REACHED HERE');
    return resource;
  }
}
