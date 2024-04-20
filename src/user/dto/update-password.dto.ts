import {
	IsOptional,
	IsString,
	MinLength
} from 'class-validator'


export class UpdatePasswordDto {
	@IsOptional()
	@MinLength(6, {
		message: 'Password must be at least 6 characters long'
	})
	@IsString()
	password?: string
}
