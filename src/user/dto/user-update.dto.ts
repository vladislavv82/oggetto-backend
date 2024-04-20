import { IsEmail, IsString, IsOptional, MinLength, IsNumberString } from 'class-validator';

export class UserUpdateDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsOptional()
    @MinLength(6, {
        message: 'Password must be at least 6 characters long'
    })
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string | null;

    @IsOptional()
    @IsString()
    city?: string | null;

    @IsOptional()
    @IsNumberString()
    age?: string; 

    @IsOptional()
    @IsString()
    gender?: null ;

    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString({ each: true })
    hobbies?: string[];

    @IsOptional()
    @IsString()
    about?: string | null;
}
