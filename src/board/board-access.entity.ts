import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Boards } from './board.entity';

@Entity({ name: 'board_accesses' })
export class BoardAccess {
  @PrimaryGeneratedColumn('uuid')
  @Column({ unique: true, primary: true })
  id?: string;

  @Column({ type: 'uuid' })
  board_id?: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  role: string;

  @ManyToOne(() => Boards, (board) => board.board_access)
  @JoinColumn({ name: 'board_id' })
  board?: Boards;

  @CreateDateColumn()
  @Column({ type: 'timestamptz' })
  created_at?: Date;

  @UpdateDateColumn()
  @Column({ type: 'timestamptz' })
  updated_at?: Date;
}
