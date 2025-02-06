import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import {
  CreateCommentDto,
  UpdateCommentDto,
  UpdateLikeStatusDto,
} from '../dto/create-comment.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { isValidObjectId } from 'mongoose';
import { UsersRepository } from '../../user-accounts/infrastructure/users.repository';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<CommentViewDto> {
    await this.postsRepository.findOrNotFoundFail(dto.postId); //// проверка на наличие поста
    const user = await this.usersRepository.findOrNotFoundFail(dto.userId);
    const comment = this.CommentModel.createInstance({
      content: dto.content,
      userId: dto.userId,
      postId: dto.postId,
      userLogin: user.accountData.login,
    });
    await this.commentsRepository.save(comment);
    return await this.commentsQueryRepository.findCommentById(
      comment._id.toString(),
    );
  }
  async updateComment(dto: UpdateCommentDto): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      dto.commentId,
    );
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    if (comment.commentatorInfo.userId !== dto.userId) {
      throw ForbiddenDomainException.create(
        'the comment does not belong to you',
      );
    }
    comment.update({ content: dto.content });
    await this.commentsRepository.save(comment);
  }
  async updateLikeStatus(dto: UpdateLikeStatusDto) {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      dto.commentId,
    );
    let likesCount = comment.likesInfo.likesCount;
    let dislikesCount = comment.likesInfo.dislikesCount;
    const foundUser = await this.commentsRepository.findUserInLikeInfo(
      dto.commentId,
      dto.userId,
    );
    if (!foundUser) {
      await this.commentsRepository.pushUserInLikesInfo(
        dto.commentId,
        dto.userId,
        dto.likeStatus,
      );

      if (dto.likeStatus === 'Like') {
        likesCount++;
      }
      if (dto.likeStatus === 'Dislike') {
        dislikesCount++;
      }
      await this.commentsRepository.updateLikesCount(
        dto.commentId,
        likesCount,
        dislikesCount,
      );
      return;
    }
    const userLikeStatus = await this.commentsRepository.findUserLikeStatus(
      dto.commentId,
      dto.userId,
    );
    switch (userLikeStatus) {
      case 'None':
        if (dto.likeStatus === 'Like') {
          likesCount++;
        }
        if (dto.likeStatus === 'Dislike') {
          dislikesCount++;
        }
        break;
      case 'Like':
        if (dto.likeStatus === 'None') {
          likesCount--;
        }
        if (dto.likeStatus === 'Dislike') {
          likesCount--;
          dislikesCount++;
        }
        break;
      case 'Dislike':
        if (dto.likeStatus === 'None') {
          dislikesCount--;
        }
        if (dto.likeStatus === 'Like') {
          dislikesCount--;
          likesCount++;
        }
    }
    await this.commentsRepository.updateLikesCount(
      dto.commentId,
      likesCount,
      dislikesCount,
    );
    await this.commentsRepository.updateLikesStatus(
      dto.commentId,
      dto.userId,
      dto.likeStatus,
    );
  }

  async deleteComment(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw NotFoundDomainException.create('comment not found');
    }
    const comment = await this.commentsRepository.findOrNotFoundFail(id);
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    if (comment.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create(
        'the comment does not belong to you',
      );
    }
    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
