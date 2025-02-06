import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

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
      throw NotFoundDomainException.create('post not found', 'postId');
    }
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!post) {
      throw NotFoundDomainException.create('post not found', 'postId');
    }

    return post;
  }
  async findUserInLikesInfo(
    postId: string,
    userId: string,
  ): Promise<PostDocument | null> {
    const foundUser = await this.PostModel.findOne({
      _id: postId,
      'likesInfo.users.userId': userId,
    });
    if (!foundUser) {
      return null;
    }
    return foundUser;
  }
  async findUserLikeStatus(postId: string, userId: string) {
    const foundUser = await this.PostModel.findOne(
      { _id: postId },
      {
        'likesInfo.users': {
          $filter: {
            input: '$likesInfo.users',
            cond: { $eq: ['$$this.userId', userId] },
          },
        },
      },
    );
    if (!foundUser || foundUser.likesInfo.users.length === 0) {
      return null;
    }
    return foundUser.likesInfo.users[0].likeStatus;
  }
  async save(post: PostDocument) {
    await post.save();
  }
  async updateLikesStatus(
    postId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const result = await this.PostModel.updateOne(
      { _id: postId, 'likesInfo.users.userId': userId },
      {
        $set: {
          'likesInfo.users.$.likeStatus': likeStatus,
        },
      },
    );

    return result.matchedCount === 1;
  }
}
