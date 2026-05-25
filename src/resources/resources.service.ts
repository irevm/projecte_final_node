import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { type Resource } from './resource.model';
import { FindResourcesQueryDto } from './dto/find-resources-query.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Resource } from './resource.model';
import { User } from '../users/user.model';
@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: Repository<Resource>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(query: FindResourcesQueryDto): Promise<Resource[]> {
    const { type, status } = query;

    // const where: Partial<Resource> = {};
    // Perquè accepti null a assignedToUserId
    const where: FindOptionsWhere<Resource> = {};

    if (type !== undefined) where.type = type;
    if (status !== undefined) where.status = status;

    return this.resourcesRepository.find({
      where,
      relations: {
        assignedToUser: true,
      },
    });
  }

  async findOne(id: number): Promise<Resource> {
    const resource = await this.resourcesRepository.findOne({
      where: { id },
      relations: {
        assignedToUser: true,
      },
    });

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

    const user = await this.usersRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (resource.status === 'assigned') {
      throw new BadRequestException('Resource already assigned');
    }

    resource.status = 'assigned';
    //resource.assignedToUserId = userId;
    resource.assignedToUser = user;

    return this.resourcesRepository.save(resource);
  }

  async release(resourceId: number): Promise<Resource> {
    const resource = await this.findOne(resourceId);

    if (resource.status === 'available') {
      throw new BadRequestException('Resource already available');
    }

    resource.status = 'available';
    //resource.assignedToUserId = null;
    resource.assignedToUser = null;

    return this.resourcesRepository.save(resource);
  }
}
