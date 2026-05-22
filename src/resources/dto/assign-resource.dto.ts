import { IsInt, IsPositive } from 'class-validator';

export class AssignResourceDto {
  @IsInt()
  @IsPositive()
  userId!: number;
}
