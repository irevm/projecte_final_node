import { Injectable, NotFoundException } from '@nestjs/common';
// import { type Resource } from './resource.model';
import { FindResourcesQueryDto } from './dto/find-resources-query.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Resource } from './resource.model';
@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: Repository<Resource>,
  ) {}

  async findAll(query: FindResourcesQueryDto): Promise<Resource[]> {
    const { type, status } = query;

    // const where: Partial<Resource> = {};
    const where: FindOptionsWhere<Resource> = {};

    if (type !== undefined) where.type = type;
    if (status !== undefined) where.status = status;

    return this.resourcesRepository.find({ where });
  }

  async findOne(id: number): Promise<Resource> {
    const resource = await this.resourcesRepository.findOneBy({ id });

    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    return resource;
  }

  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = this.resourcesRepository.create({
      ...dto,
      status: 'available',
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
    });

    return this.resourcesRepository.save(resource);
  }

  async update(id: number, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.findOne(id);

    Object.assign(resource, dto);

    return this.resourcesRepository.save(resource);
  }

  async remove(id: number): Promise<Resource> {
    const resource = await this.findOne(id);

    return this.resourcesRepository.remove(resource);
  }

  async assign(resourceId: number, userId: number): Promise<Resource> {
    const resource = await this.findOne(resourceId);

    resource.status = 'assigned';
    resource.assignedToUserId = userId;

    return this.resourcesRepository.save(resource);
  }

  async release(resourceId: number): Promise<Resource> {
    const resource = await this.findOne(resourceId);

    resource.status = 'available';
    resource.assignedToUserId = null;

    return this.resourcesRepository.save(resource);
  }
}
