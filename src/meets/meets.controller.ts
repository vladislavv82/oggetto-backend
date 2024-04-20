import { Controller, Delete, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService) {}


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

}
