import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: dto,
      });
    } catch (error) {
      throw new Error(`Ошибка при создании роли: ${error}`);
    }
  }

  async getRoleByValue(value: string) {
    try {
      return await this.prisma.role.findUnique({
        where: {
            value: value
      }
    });
    } catch (error) {
      throw new Error(`Ошибка при получении роли: ${error}`);
    }
  }
}
