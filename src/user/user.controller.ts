import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { UserService } from './user.service'
import { Roles } from 'src/auth/decorators/roles-auth.decorator'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { AddRoleDto } from './dto/add-role.dto'
import { UserUpdateDto } from './dto/user-update.dto'

@Controller('user/profile')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@Auth()
	async profile(@CurrentUser('id') id: string) {
		return this.userService.getProfile(id)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put()
	@Auth()
	async updateProfile(@CurrentUser('id') id: string, @Body() dto: UserUpdateDto) {
		return this.userService.update(id, dto)
	}

	//only ADMIN
	@Auth()
	@Get("/all")
	@Roles('ADMIN')
	@UseGuards(RolesGuard)
	async getAllUsers() {
		return this.userService.getAllUsers()
	}

	//only ADMIN
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
	@Auth()
    @Post('/role')
    async addRole(@Body() dto: AddRoleDto) {
        return this.userService.addRole(dto);
    }

	//only ADMIN
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
	@Delete(':id')
	async removeUser(@Param('id') id: string) {
		try {
		  const result = await this.userService.removeUserById(id);

		  return { message: result.message };
		} catch (error) {
		  console.log(error);
		}
	}
}
