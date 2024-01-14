import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boards } from './board.entity';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { EventModule } from '@src/event/event.module';
import { BoardAccess } from './board-access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boards, BoardAccess]), EventModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
