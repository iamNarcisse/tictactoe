import { IsString, MaxLength, MinLength } from 'class-validator';
import { Boards } from '../board.entity';
export class JoinBoardParams extends Boards {
  @MaxLength(6)
  @MinLength(6)
  @IsString()
  room: string;

  @IsString()
  socketID: string;

  @IsString()
  sessionID: string;
}
