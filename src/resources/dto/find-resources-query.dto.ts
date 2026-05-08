import { IsIn, IsOptional } from 'class-validator';
import {
  RESOURCE_TYPES,
  RESOURCE_STATUS,
  type ResourceType,
  type ResourceStatus,
} from '../resource.model';

export class FindResourcesQueryDto {
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: ResourceType;

  @IsOptional()
  @IsIn(RESOURCE_STATUS)
  status?: ResourceStatus;
}
