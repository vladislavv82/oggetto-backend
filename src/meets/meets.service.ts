import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MeetsService {
    constructor(private prisma: PrismaService,
        private mailService: MailService
    ) {}
    
    @Cron(CronExpression.EVERY_5_MINUTES)
    async createRandomPairs() {
        try {
            // Получаем всех пользователей из базы данных
            const allUsers = await this.prisma.user.findMany();
            
            // Если количество пользователей нечетное, убираем одного пользователя
            let usersToPair = allUsers;
            let unpairedUser: any = null;
            if (allUsers.length % 2 !== 0) {
                console.log('Количество пользователей нечетное, убираем одного пользователя из пары');
                unpairedUser = usersToPair.pop();
            }
        
            // Создаем пары пользователей
            const shuffledUsers = this.shuffleArray(usersToPair);
            const usedIndexes: number[] = []; // массив для хранения индексов уже использованных пользователей
            for (let i = 0; i < shuffledUsers.length; i += 2) {
                let user1Index = this.getRandomIndex(shuffledUsers.length, usedIndexes);
                let user2Index = this.getRandomIndex(shuffledUsers.length, usedIndexes);

                // Проверяем, чтобы оба пользователя в паре были разные
                while (user1Index === user2Index) {
                    user2Index = this.getRandomIndex(shuffledUsers.length, usedIndexes);
                }

                const user1 = shuffledUsers[user1Index];
                const user2 = shuffledUsers[user2Index];

                let title = 'Встреча';
                if (user1 && user1.name && user2 && user2.name) {
                    title += ` между пользователем ${user1.name} и ${user2.name} `;
                } else if (user1 && user1.name) {
                    title += ` с ${user1.name}`;
                } else if (user2 && user2.name) {
                    title += ` с ${user2.name}`;
                } else {
                    title += ` с неизвестными пользователями`;
                }

                console.log(`Создана пара: ${title}`);

                //отправляем письмо с подтверждением
		        await this.mailService.sendPairEmail(user1.email, user2.email); 
               
                const meet = await this.prisma.meets.create({
                    data: {
                        title: title,
                        location: 'Random coffee',
                        datetime: new Date(),
                        users: {
                            create: [ 
                                { userId: user1.id }, 
                                { userId: user2.id }, 
                            ],
                        },
                    },
                });

                // Добавляем индексы использованных пользователей в массив
                usedIndexes.push(user1Index, user2Index);
            }

            // Если был убран один пользователь из пары, выводим его информацию
            if (unpairedUser) {
                console.log(`Один пользователь не получил пару: ${unpairedUser.email}`);
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

    private getRandomIndex(max: number, usedIndexes: number[]): number {
        let index = Math.floor(Math.random() * max);
        // Проверяем, что индекс не был использован ранее
        while (usedIndexes.includes(index)) {
            index = Math.floor(Math.random() * max);
        }
        return index;
    }

    async getAllMeets(): Promise<any[]> {
        const meets = await this.prisma.meets.findMany({
            include: {
                users: true, // Включаем пользователей для каждой встречи
            },
        });
        
        // Для каждой встречи получаем пользователей по их идентификаторам
        for (const meet of meets) {
            const users = await this.getUsersByIds(meet.users.map(user => user.userId));
            meet.users = users;
        }

        return meets;
    }

    async getUsersByIds(userIds: string[]): Promise<any[]> {
        return this.prisma.user.findMany({
            where: {
                id: {
                    in: userIds, // Фильтр для поиска пользователей по их идентификаторам
                },
            },
        });   
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

    async getMeetByUserId(userId: string): Promise<any> {
        const meetUser = await this.prisma.meetsUser.findFirst({
            where: {
                userId: userId,
            },
            include: {
                meet: {
                    include: {
                        users: {
                            where: {
                                NOT: {
                                    userId: userId,
                                },
                            },
                        },
                    },
                },
            },
        });
    
        if (!meetUser) {
            throw new NotFoundException(`Meet for user with id ${userId} not found`);
        }

        const secondUser = meetUser.meet.users[0].userId;
        console.log(secondUser);
        const partner = await this.prisma.user.findFirst({
            where: {
                id: secondUser,
            }
        })
    
        return {
            meet: {
                ...meetUser.meet,
                users: partner ? [partner] : [],
            },
        };
    }

    
    // Функция для обновления статуса встречи по её идентификатору
    async updateMeetStatus(meetId, newStatus) {
        try {
        // Находим встречу по идентификатору
        const meet = await this.prisma.meets.findUnique({
            where: {
            id: meetId
            }
        });
    
        // Проверяем, существует ли встреча с указанным идентификатором
        if (!meet) {
            throw new Error('Встреча с указанным идентификатором не найдена');
        }
        
        // Проверяем, если текущий статус встречи уже "active" и новый статус также "active", то обновляем его на "fullactive"
        if (meet.status === 'active' && newStatus === 'active') {
            newStatus = 'fullactive';
        }
    
        // Обновляем статус встречи
        const updatedMeet = await this.prisma.meets.update({
            where: {
            id: meetId
            },
            data: {
            status: newStatus
            }
        });
    
        return updatedMeet;
        } catch (error) {
        console.error('Произошла ошибка при обновлении статуса встречи:', error);
        throw error;
    }
  }

    

}