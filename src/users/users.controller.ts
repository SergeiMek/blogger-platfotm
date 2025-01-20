/*
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CatsRepository } from '../cats/cats.repository';

@Controller('users')
class UsersController {
  constructor(
    protected usersService: UsersService,
    private readonly catsService: CatsRepository,
  ) {}
  @Get()
  getAllUsers(@Query('term') term: string) {
    return this.usersService.findUsers(term);
  }
  @Get(':id')
  getUsersById(@Param() params: { id: string }) {
    return [{ id: 1 }, { id: 2 }].find((u) => u.id === +params.id);
  }

  @Post()
  createUsers(@Body() inputModel: CreateUserInputModelType) {
    return {
      id: 12,
      name: inputModel.name,
      childrenCount: inputModel.childrenCount,
    };
  }
  @Delete(':id')
  deleteUsers(@Param('id') userId: string) {
    return;
  }
  @Put(':id')
  updateUser(
    @Param('id') userId: string,
    @Body() model: CreateUserInputModelType,
  ) {
    return {
      id: userId,
      model: model,
    };
  }
}

type CreateUserInputModelType = {
  name: string;
  childrenCount: number;
};
*/
