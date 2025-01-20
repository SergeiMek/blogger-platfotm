import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../bloggers-platform/domain/blogs.entity';
import {
  Comment,
  CommentModelType,
} from '../bloggers-platform/domain/comments.entity';
import { Post, PostModelType } from '../bloggers-platform/domain/posts.entity';
import { User, UserModelType } from '../user-accounts/domain/user.entity';

@Controller('testing')
export class AllDeleteController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}
  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dropDB(): Promise<void> {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.UserModel.deleteMany();
  }
}
