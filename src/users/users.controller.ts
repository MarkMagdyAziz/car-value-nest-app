import { Serialize } from '../interceptors/serialize.interceptor';
import type { UserSearchQueries } from '../types/user.type';
import { CreateUserDto } from './dto/create-user.dto';
import { SerializedUserDto } from './dto/SerializedUser.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
@Controller('users')
@Serialize<SerializedUserDto>(SerializedUserDto)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/signup')
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Post('/search')
  find(@Body() searchQueries: UserSearchQueries) {
    return this.userService.findSearch(searchQueries);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Query('id') ids: string | string[]) {
    return this.userService.remove(+ids);
  }
}
