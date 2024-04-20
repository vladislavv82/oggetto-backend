import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'
import { UserService } from 'src/user/user.service'
import { ConfigService } from '@nestjs/config'
import { AuthDto } from './dto/auth.dto'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private configService: ConfigService,
		private mailService: MailService
	) {}

	async login(dto: AuthDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id, user.roles.map(role => role.value))

		return {
			user,
			...tokens
		}
	}

	async register(dto: AuthDto) {
		const oldUser = await this.userService.getByEmail(dto.email)

		if (oldUser) throw new BadRequestException('Пользователь с таким email уже существует')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.create(dto)

		//отправляем письмо с подтверждением
		await this.mailService.sendUserConfirmation(dto.email, user.id); 

		const tokens = this.issueTokens(user.id, user.roles.map(role => role.value))

		return {
			user,
			...tokens
		}
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.getById(result.id)

		const tokens = this.issueTokens(user.id, user.roles.map(role => role.value))

		return {
			user,
			...tokens
		}
	}

	private issueTokens(userId: string, roles: string[]) {
		const data = { id: userId, roles: roles }

		const accessToken = this.jwt.sign(data, {
			expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
		})

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user) throw new NotFoundException('Наверный логин или пароль')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Наверный логин или пароль')

		return user
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: this.configService.get<string>('DOMAIN_COOKIE'),
			expires: expiresIn,
			secure: true,
			// lax if production
			sameSite: this.configService.get<string>('NODE_ENV') === 'production'? 'lax' : 'none',
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: this.configService.get<string>('DOMAIN_COOKIE'),
			expires: new Date(0),
			secure: true,
			// lax if production
			sameSite: this.configService.get<string>('NODE_ENV') === 'production'? 'lax' : 'none',
		})
	}
}
