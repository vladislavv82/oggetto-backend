import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  //TODO только для ADMIN???
  @Post()
  @Auth()
  @HttpCode(200)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }
  //Не нужно???
  @Get('/:value')
  @Auth()
  getByValue(@Param('value') value: string) {
    return this.rolesService.getRoleByValue(value);
  }
}
