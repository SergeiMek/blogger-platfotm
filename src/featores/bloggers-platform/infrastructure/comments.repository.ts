import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  /*  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }*/

  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    if (!isValidObjectId(id)) {
      throw NotFoundDomainException.create('comment not found', 'commentId');
    }
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!comment) {
      throw NotFoundDomainException.create('comment not found', 'commentId');
    }

    return comment;
  }
  async save(comment: CommentDocument) {
    await comment.save();
  }
  async findUserInLikeInfo(
    commentId: string,
    userId: string,
  ): Promise<CommentDocument | null> {
    const foundUser = await this.CommentModel.findOne({
      _id: commentId,
      'likesInfo.users.userId': userId,
    });
    if (!foundUser) {
      return null;
    }
    return foundUser;
  }
  async pushUserInLikesInfo(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { _id: commentId },
      {
        $push: {
          'likesInfo.users': {
            userId,
            likeStatus,
          },
        },
      },
    );
    return result.matchedCount === 1;
  }
  async updateLikesCount(
    commentId: string,
    likesCount: number,
    dislikeCount: number,
  ): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { _id: commentId },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikeCount,
        },
      },
    );
    return result.matchedCount === 1;
  }
  async findUserLikeStatus(
    commentId: string,
    userId: string,
  ): Promise<string | null> {
    const foundUser = await this.CommentModel.findOne(
      { _id: commentId },
      {
        'likesInfo.users': {
          $filter: {
            input: '$likesInfo.users',
            cond: { $eq: ['$$this.userId', userId.toString()] },
          },
        },
      },
    ).lean();
    if (!foundUser || foundUser.likesInfo.users.length === 0) {
      return null;
    }

    return foundUser.likesInfo.users[0].likeStatus;
  }
  async updateLikesStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { _id: commentId, 'likesInfo.users.userId': userId },
      {
        $set: {
          'likesInfo.users.$.likeStatus': likeStatus,
        },
      },
    );
    return result.matchedCount === 1;
  }
}
