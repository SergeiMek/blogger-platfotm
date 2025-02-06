import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDomainDto } from './dto/create-blog.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import {
  pushUserInLikesInfoDto,
  updateLikesCount,
  updateLikesStatusDto,
  UpdatePostDto,
} from '../dto/create-post.dto';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

@Schema()
class User {
  addedAt: string;
  @Prop({ true: String, required: true })
  userId: string;
  @Prop({ true: String, required: true })
  userLogin: string;
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

const likesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema({ timestamps: true })
export class Post {
  @Prop({ true: String, required: true })
  title: string;
  @Prop({ true: String, required: true })
  shortDescription: string;
  @Prop({ true: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  blogName: string;
  @Prop({ type: likesInfoSchema, default: new LikesInfo() })
  likesInfo: LikesInfo;
  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  createdAt: Date;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }
  update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }
  pushUserInLikesInfo(dto: pushUserInLikesInfoDto) {
    this.likesInfo.users.push({
      addedAt: new Date().toISOString(),
      userId: dto.userId,
      userLogin: dto.userLogin,
      likeStatus: dto.likeStatus,
    });
  }
  updateLikesCount(dto: updateLikesCount) {
    this.likesInfo.likesCount = dto.likesCount;
    this.likesInfo.dislikesCount = dto.dislikesCount;
  }
  updateLikesStatus(dto: updateLikesStatusDto) {
    const updatedUser = this.likesInfo.users.find(
      (f) => f.userId === dto.userId,
    );
    if (!updatedUser) {
      throw BadRequestDomainException.create('server error', 'error');
    }
    updatedUser.likeStatus = dto.likeStatus;
  }
  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
