import { Controller, Delete, Get, Param } from '@nestjs/common';
import { MeetsService } from './meets.service';

@Controller('meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService) {}


  ////НЕ НУЖЕН
  @Get('create-random-pairs')
  async createRandomPairs() {
    await this.meetsService.createRandomPairs();
    return { message: 'Random pairs created successfully' };
  }

  @Get('all-meets')
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
