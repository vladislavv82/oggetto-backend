import { Module } from '@nestjs/common';
import { MeetsService } from './meets.service';
import { MeetsController } from './meets.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  controllers: [MeetsController],
  providers: [MeetsService, PrismaService],
})
export class MeetsModule {}
