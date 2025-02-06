import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import {
  CreateCommentDomainDto,
  UpdateCommentDto,
} from './dto/create-comment.domain.dto';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

@Schema()
class User {
  @Prop({ true: String, required: true })
  userId: string;
  @Prop({ true: String, required: true })
  likeStatus: string;
}
const UserSchema = SchemaFactory.createForClass(User);

@Schema()
class LikesInfo {
  @Prop({ default: 0, true: Number, required: true })
  likesCount: number;
  @Prop({ default: 0, true: Number, required: true })
  dislikesCount: number;
  @Prop({ default: [], true: [UserSchema] })
  users: User[];
}

@Schema()
class CommentatorInfo {
  @Prop({ true: String })
  userId: string;
  @Prop({ true: String })
  userLogin: string;
}

const commentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);
const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema({ timestamps: true })
export class Comment {
  @Prop({ true: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({
    type: commentatorInfoSchema,
    required: true,
    default: new CommentatorInfo(),
  })
  commentatorInfo: CommentatorInfo;
  @Prop({ type: LikesInfoSchema, default: new LikesInfo() })
  likesInfo: LikesInfo;
  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  createdAt: Date;

  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    //comment.likesInfo = new LikesInfo();
    comment.likesInfo.users.push({
      likeStatus: 'None',
      userId: dto.userId,
    });
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    return comment as CommentDocument;
  }
  update(dto: UpdateCommentDto) {
    this.content = dto.content;
  }
  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
