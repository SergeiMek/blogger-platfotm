import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, DeletionStatus } from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  /*  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }*/

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('post not found');
    }
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return post;
  }
  async save(post: PostDocument) {
    await post.save();
  }
}
