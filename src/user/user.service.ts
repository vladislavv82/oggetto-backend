import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import { UserUpdateDto } from './dto/user-update.dto'
import { StatusConfirmed } from '@prisma/client';
import { RolesService } from 'src/roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';
import { differenceInYears, format, formatISO, parseISO } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private roleService: RolesService,
  ) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    });
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        roles: true,
      },
    });
  }

  //TODO только для админов
  async getAllUsers() {
    try {
      return this.prisma.user.findMany({
        include: {
          roles: true,
          meets: true,
        },
      });
    } catch (error) {
      throw new HttpException('Error', HttpStatus.NOT_FOUND);
    }
  }
  //TODO только для админов 
// В сервисе пользователя
async removeUserById(id: string) {
  try {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        meets: true, // Включаем связанные встречи пользователя
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Удаляем все связанные записи в MeetsUser для этого пользователя
    await this.prisma.meetsUser.deleteMany({
      where: {
        userId: id,
      },
    });

    // Теперь удаляем пользователя
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.log(error);
    throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  async addRole(dto: AddRoleDto) {
    const { userId, value } = dto;
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const role = await this.prisma.role.findUnique({
      where: { value },
    });
    
    // Если пользователь и роль найдены, добавляем роль пользователю
    if (role && user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: { connect: { id: role.id } },
        },
      });
      
      return dto;
    }
    throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
  }

  async getProfile(id: string) {
    const profile = await this.getById(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = profile;

    return {
      user: rest,
    };
  }

  async confirm(id: string) {
    const user = await this.getById(id);

    //TODO проверка на то что если StatusConfirmed не = blocked, то тогда можно сменить на active
    if (user) {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          status: StatusConfirmed.active,
        },
      });
    }
  }

  //при создании пользователя - роль USER
  async create(dto: AuthDto) {
    const role = await this.roleService.getRoleByValue('USER');
    const hashedPassword = await hash(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: '',
        phoneNumber: '',
        city: '',
        gender: null,
        dateOfBirth: null,
        hobbies: [],
        redFlags: [],
        password: hashedPassword,
        roles: {
          connect: {
            id: role.id,
          },
        },
      },
      include: { roles: true },
    });
  }

  
  async update(id: string, dto: UserUpdateDto) {
    let data = dto;

    if (dto.dateOfBirth){
      const dateOfBirth = parseISO(dto.dateOfBirth); // Преобразуем строку в объект даты
      const today = new Date(); // Получаем текущую дату
      const age = differenceInYears(today, dateOfBirth); // Вычисляем разницу в годах
      data = { ...data, dateOfBirth: formatISO(dateOfBirth,{ representation: 'complete' }), age: age.toString() };
    }

    if (dto.password) {
      data = { ...dto, password: await hash(dto.password) };
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        age: true,
        gender: true,
        dateOfBirth: true,
        hobbies: true,
        redFlags: true
      },
    });
  }
}
