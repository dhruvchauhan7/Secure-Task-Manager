import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../auth/jwt.strategy';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
  ) {}

  /**
   * List tasks for the user's org.
   * Sorted by sortOrder (desc) then createdAt (desc) so drag/drop can later
   * update sortOrder without changing this API.
   */
  async list(user: JwtPayload): Promise<TaskEntity[]> {
    return this.tasksRepo.find({
      where: { orgId: user.orgId },
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Create task in user's org.
   */
  async create(dto: CreateTaskDto, user: JwtPayload): Promise<TaskEntity> {
    const task = this.tasksRepo.create({
      orgId: user.orgId,
      createdByEmail: user.email,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: dto.status ?? 'OPEN',

  
      category: dto.category?.trim() || 'General',
      sortOrder: Date.now(), // monotonic-ish default ordering
    });

    return this.tasksRepo.save(task);
  }

  /**
   * Update task only if it belongs to user's org.
   */
  async update(id: string, dto: UpdateTaskDto, user: JwtPayload): Promise<TaskEntity> {
    const task = await this.tasksRepo.findOne({
      where: { id, orgId: user.orgId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description?.trim() || null;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.category !== undefined) task.category = dto.category?.trim() || 'General';
    if (dto.sortOrder !== undefined) task.sortOrder = dto.sortOrder;

    return this.tasksRepo.save(task);
  }

  /**
   * Delete task only if it belongs to user's org.
   */
  async remove(id: string, user: JwtPayload): Promise<{ ok: true }> {
    const result = await this.tasksRepo.delete({ id, orgId: user.orgId });

    if (!result.affected) {
      throw new NotFoundException('Task not found');
    }

    return { ok: true };
  }
}
