import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto';
import type { FindUsersQueryDto } from './dto/find-users-query.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Anna Serra',
      email: 'anna@example.com',
      role: 'member',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  findAll(query: FindUsersQueryDto): User[] {
    const { active, role } = query;

    return this.users.filter((user) => {
      const matchesActive = active === undefined || user.active === active;
      const matchesRole = role === undefined || user.role === role;

      return matchesActive && matchesRole;
    });
  }

  findOne(id: number): User {
    const user = this.users.find((currentUser) => currentUser.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length + 1,
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
      active: true,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const currentUser = this.users[userIndex];
    const {
      name = currentUser.name,
      email = currentUser.email,
      role = currentUser.role,
      active = currentUser.active,
    } = updateUserDto;

    this.users[userIndex] = {
      ...currentUser,
      name,
      email,
      role,
      active,
    };

    return this.users[userIndex];
  }

  remove(id: number): User {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const [deletedUser] = this.users.splice(userIndex, 1);

    return deletedUser;
  }
}
