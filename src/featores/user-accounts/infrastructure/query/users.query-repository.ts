import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus, User, UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return UserViewDto.mapToView(user);
  }
  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {
      /// deletionStatus: DeletionStatus.NotDeleted,
    };
    if (query.searchEmailTerm || query.searchLoginTerm) {
      filter.$or = [];
    } /*else {
      filter = { deletionStatus: DeletionStatus.NotDeleted };
    }*/
    if (query.searchEmailTerm) {
      filter.$or!.push({
        ['accountData.email']: { $regex: query.searchEmailTerm, $options: 'i' }, /// , $options: 'i'
      });
    }
    if (query.searchLoginTerm) {
      filter.$or!.push({
        ['accountData.login']: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }
    const users = await this.UserModel.find({
      ...filter,
      deletionStatus: DeletionStatus.NotDeleted,
    })
      .sort({
        [query.sortBy === 'createdAt'
          ? query.sortBy
          : `accountData.${query.sortBy}`]: query.sortDirection,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
    const totalCount = await this.UserModel.countDocuments(filter);
    const items = users.map(UserViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
