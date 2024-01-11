import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'boards' })
export class Boards {
  @PrimaryGeneratedColumn('uuid')
  @Column({ unique: true, primary: true })
  id: string;

  @CreateDateColumn()
  @Column({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn()
  @Column({ type: 'timestamptz' })
  updated_at: Date;
}
