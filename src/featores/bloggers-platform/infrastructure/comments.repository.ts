import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';

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
      throw new NotFoundException('comment not found');
    }
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    return comment;
  }
  async save(comment: CommentDocument) {
    await comment.save();
  }
}
