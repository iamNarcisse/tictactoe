import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardParams } from './dto/create';
import { JoinBoardParams } from './dto/join';
import { PatchBoardParams } from './dto/patch';

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

  @Patch(':code')
  async manageBoard(
    @Body() params: PatchBoardParams,
    @Param('code') code: string,
  ) {
    params.code = code;
    const resource = await this.service.updateBoard(params);
    return resource;
  }
}
