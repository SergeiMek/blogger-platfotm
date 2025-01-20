import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
  DeletionStatus,
} from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private UserModel: BlogModelType) {}

  /*  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }*/

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('user not found');
    }
    const blog = await this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!blog) {
      throw new NotFoundException('user not found');
    }

    return blog;
  }
  async save(user: BlogDocument) {
    await user.save();
  }
}
