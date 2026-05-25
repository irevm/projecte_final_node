import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import 'dotenv/config';
import OpenAI from 'openai';
import type { Resource } from '../resources/resource.model';
import { ResourcesService } from '../resources/resources.service';
import { ParseResourceAssignmentDto } from './dto/parse-resource-assignment.dto';

type ResourceAssignmentIds = {
  userId: number;
  resourceId: number;
};
@Injectable()
export class UsersService {
  private client?: OpenAI;
  private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly resourcesService: ResourcesService,
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

  private getClient(): OpenAI {
    if (!process.env.OPENAI_API_KEY) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }
    this.client ??= new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return this.client;
  }

  private parseAssignmentJson(
    outputText: string,
  ): ResourceAssignmentIds | { error: string } {
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new BadRequestException('OpenAI did not return valid JSON');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new BadRequestException('OpenAI did not return valid JSON');
    }
    if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) {
      return { error: String(parsed.error) };
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('userId' in parsed) ||
      !('resourceId' in parsed) ||
      typeof parsed.userId !== 'number' ||
      typeof parsed.resourceId !== 'number'
    ) {
      throw new BadRequestException(
        'OpenAI did not return userId and resourceId',
      );
    }
    return {
      userId: parsed.userId,
      resourceId: parsed.resourceId,
    };
  }

  async parseResourceAssignment(
    parseResourceAssignmentDto: ParseResourceAssignmentDto,
  ): Promise<Resource> {
    const response = await this.getClient().responses.create({
      model: this.model,
      input: [
        {
          role: 'system',
          content:
            'Output strict JSON only. Example: {"userId":1,"resourceId":2}',
          //Canvi fet perquè sinó no tornava l'estructura que volem
          // 'Extract resource assignment ids from the user command. Return only JSON with',
        },
        {
          role: 'user',
          content: parseResourceAssignmentDto.command, //text de command
        },
      ],
    });

    const parsedAssignment = this.parseAssignmentJson(response.output_text);

    if ('error' in parsedAssignment) {
      throw new BadRequestException('userId and resourceId are required');
    }

    // return this.resourcesService.assign(parsedAssignment.resourceId, {
    //   userId: parsedAssignment.userId,
    // });

    return this.resourcesService.assign(
      parsedAssignment.resourceId,
      parsedAssignment.userId,
    );
  }
}
