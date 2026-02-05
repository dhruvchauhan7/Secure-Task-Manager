import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'OPEN' })
  status!: TaskStatus;

  @Column({ type: 'varchar', length: 50, default: 'General' })
  category!: string;

  @Column({ type: 'varchar', length: 100 })
  orgId!: string;

  @Column({ type: 'varchar', length: 200 })
  createdByEmail!: string;

  // Optional but useful for ordering
  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
