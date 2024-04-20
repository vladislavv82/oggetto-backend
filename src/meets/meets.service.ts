import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MeetsService {
    constructor(private prisma: PrismaService) {}
    
    @Cron(CronExpression.EVERY_5_MINUTES)
    async createRandomPairs() {
        try {
            // Получаем всех пользователей из базы данных
            const allUsers = await this.prisma.user.findMany();
        
            // Создаем пары пользователей
            const shuffledUsers = this.shuffleArray(allUsers);
            for (let i = 0; i < shuffledUsers.length; i += 2) {
                const user1 = shuffledUsers[i];
                const user2 = shuffledUsers[i + 1];

                let title = 'Встречайтесь';
                if (user1.name && user2.name) {
                    title += ` между ${user1.name} и ${user2.name}`;
                } else if (user1.name) {
                    title += ` с ${user1.name}`;
                } else if (user2.name) {
                    title += ` с ${user2.name}`;
                } else {
                    title += ` с неизвестными пользователями`;
                }

                console.log(`Creating random pair: ${title}`);
                // Создаем встречу для пары пользователей
                const meet = await this.prisma.meets.create({
                    data: {
                        title: title,
                        location: 'Some location',
                        datetime: new Date(),
                        users: {
                            create: [ 
                                { userId: user1.id }, 
                                { userId: user2.id }, 
                            ],
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Error creating random pairs:', error);
            throw error;
        }
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async getAllMeets(): Promise<any[]> {
        return this.prisma.meets.findMany();
    }

    async getUsersByMeetId(meetId: string): Promise<any[]> {
        const meets = await this.prisma.meets.findUnique({
            where: {
                id: meetId,
            },
            include: {
                users: true,
            },
        });

        if (!meets) {
            throw new NotFoundException(`Meet with id ${meetId} not found`);
        }

        return meets.users;
    }
}