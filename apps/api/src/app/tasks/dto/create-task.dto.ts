import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE'] as const;

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';

  @IsOptional()
  @IsString()
  category?: string;
}
