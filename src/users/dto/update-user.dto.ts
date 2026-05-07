import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { USER_ROLES, type UserRole } from '../user.model';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
