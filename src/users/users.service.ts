import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(query: FindUsersQueryDto): Promise<User[]> {
    const { active, role } = query;

    const where: Partial<User> = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (role !== undefined) {
      where.role = role;
    }

    return await this.usersRepository.find({ where });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      active: true,
    });

    const users = this.usersRepository.save(user);

    return users;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    const users = this.usersRepository.save(user);
    return users;
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);

    const users = this.usersRepository.remove(user);

    return users;
  }
}
