import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardAccess } from './board-access.entity';

@Entity({ name: 'boards' })
export class Boards {
  @PrimaryGeneratedColumn('uuid')
  @Column({ unique: true, primary: true })
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  winner_id: string;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'text' })
  short_code: string;

  @OneToMany(() => BoardAccess, (access) => access.board, { cascade: true })
  board_access: BoardAccess[];

  @CreateDateColumn()
  @Column({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn()
  @Column({ type: 'timestamptz' })
  updated_at: Date;
}
