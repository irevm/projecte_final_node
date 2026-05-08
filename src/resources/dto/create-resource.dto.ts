import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import {
  RESOURCE_TYPES,
  RESOURCE_STATUS,
  type ResourceType,
  type ResourceStatus,
} from '../resource.model';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(RESOURCE_TYPES)
  type!: ResourceType;

  @IsIn(RESOURCE_STATUS)
  status!: ResourceStatus;

  @IsString()
  @IsNotEmpty()
  location!: string;
}
