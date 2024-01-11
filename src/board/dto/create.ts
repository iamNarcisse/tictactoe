import { IsString, MaxLength } from 'class-validator';
import { Boards } from '../board.entity';
export class CreateBoardParams extends Boards {
  @MaxLength(8)
  @IsString()
  user_id: string;
}
