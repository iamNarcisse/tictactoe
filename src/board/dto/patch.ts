import { IsString, MaxLength, MinLength } from 'class-validator';
import { Boards } from '../board.entity';
export class PatchBoardParams extends Boards {
  @MaxLength(6)
  @MinLength(6)
  @IsString()
  code: string;

  @IsString()
  sessionID: string;

  @IsString()
  status: string;

  winner_symbol?: string;
}
