import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(userDto: CreateUserDto) {
    const user = this.repo.create({ ...userDto });
    return this.repo.save(user);
  }

  async findOne(id: number) {
    if (!id) {
      return null;
    }

    const user = await this.repo.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async find(email: string) {
    const users = await this.repo.find({ email });
    return users;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.repo.remove(user);
  }
}
