import { Serialize } from '../interceptors/serialize.interceptor';
import { SearchUserDto } from './dto/search-user.dto';
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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@Serialize<SerializedUserDto>(SerializedUserDto)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiCreatedResponse({ type: SerializedUserDto })
  @Post('/signup')
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ type: SerializedUserDto, isArray: true })
  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Find a single user by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SerializedUserDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @ApiOperation({ summary: 'Search users by id, email or name' })
  @ApiBody({ type: SearchUserDto })
  @ApiOkResponse({ type: SerializedUserDto, isArray: true })
  @Post('/search')
  find(@Body() searchQueries: SearchUserDto) {
    return this.userService.findSearch(searchQueries);
  }

  @ApiOperation({ summary: 'Update a user by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SerializedUserDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete one or more users by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'id', required: true, description: 'User id(s) to delete' })
  @ApiOkResponse({ type: SerializedUserDto, isArray: true })
  @Delete(':id')
  remove(@Query('id') ids: string | string[]) {
    return this.userService.remove(+ids);
  }
}
