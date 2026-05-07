import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { USER_ROLES, type UserRole } from '../user.model';

export class FindUsersQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}
