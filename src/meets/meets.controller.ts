import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserService } from 'src/user/user.service';
import { MeetsStatus } from '@prisma/client';

@Controller('meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService,
    private readonly userService: UserService
  ) {}


  ////НЕ НУЖЕН
  @Get('create-random-pairs')
  async createRandomPairs() {
    await this.meetsService.createRandomPairs();
    return { message: 'Random pairs created successfully' };
  }

  //only ADMIN
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('all-meets')
  @HttpCode(200)
  async getAllMeets() {
    const meets = await this.meetsService.getAllMeets();
    return meets;
  }

  @Get('/user/:meetId')
  async getUsersByMeetId(@Param('meetId') meetId: string) {
    const users = await this.meetsService.getUsersByMeetId(meetId);
    return users;
  }

  @Get('/user-meets')
  @Auth()
  async getUserByUserId(@CurrentUser('id') id: string) {
    const users = await this.meetsService.getUsersByMeetId(id);
    return ;
  }


  @Auth()
  @Get('/partner')
  async getMeetByUserId(@CurrentUser('id') id: string): Promise<any> {
      return this.meetsService.getMeetByUserId(id);
  }

  //для ТГ БОТА
  @Get('/bot/partner')
  async getBotMeetByUserId(id: string): Promise<any> {
      return this.meetsService.getMeetByUserId(id);
  }

  @Put('/:meetId')
  async updateMeetStatus(
    @Param('meetId') meetId: string,
    @Body('status') newStatus: MeetsStatus, 
  ) {
    try {
      const updatedMeet = await this.meetsService.updateMeetStatus(meetId, newStatus);
      if (!updatedMeet) {
        throw new NotFoundException('Встреча с указанным идентификатором не найдена');
      }
      return { message: 'Статус встречи успешно обновлен' };
    } catch (error) {
      throw new NotFoundException('Произошла ошибка при обновлении статуса встречи');
    }
  }

}
