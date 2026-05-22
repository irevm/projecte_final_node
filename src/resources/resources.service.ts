import { Injectable, NotFoundException } from '@nestjs/common';
import { type Resource } from './resource.model';
import { FindResourcesQueryDto } from './dto/find-resources-query.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceDto } from './dto/create-resource.dto';

@Injectable()
export class ResourcesService {
  private resources: Resource[] = [
    {
      id: 1,
      name: 'MacBook Pro 16',
      type: 'laptop',
      status: 'available',
      location: 'Oficina Central',
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
    },
  ];

  findAll(query: FindResourcesQueryDto): Resource[] {
    const { type, status } = query;

    return this.resources.filter((resource) => {
      const matchesType = !type || resource.type === type;
      const matchesStatus = !status || resource.status === status;

      return matchesType && matchesStatus;
    });
  }

  findOne(id: number): Resource {
    const resource = this.resources.find((r) => r.id === id);

    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    return resource;
  }

  create(dto: CreateResourceDto): Resource {
    const newResource: Resource = {
      id: this.resources.length + 1,
      name: dto.name,
      type: dto.type,
      status: 'available', // Per defecte disponible
      location: dto.location,
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
    };

    this.resources.push(newResource);
    return newResource;
  }

  update(id: number, dto: UpdateResourceDto): Resource {
    const index = this.resources.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    const current = this.resources[index];

    this.resources[index] = {
      ...current,
      ...dto,
    };

    return this.resources[index];
  }

  remove(id: number): Resource {
    const index = this.resources.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    const [deleted] = this.resources.splice(index, 1);
    return deleted;
  }

  assign(resourceId: number, userId: number): Resource {
    const resource = this.findOne(resourceId);

    resource.status = 'assigned';
    resource.assignedToUserId = userId;

    return resource;
  }

  release(resourceId: number): Resource {
    const resource = this.findOne(resourceId);

    resource.status = 'available';
    resource.assignedToUserId = null;

    return resource;
  }
}
