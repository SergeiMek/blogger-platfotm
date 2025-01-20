import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../domain/blogs.entity';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { Comment, CommentModelType } from '../../domain/comments.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comment-query-params.input-dto';
import { PostsRepository } from '../posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!comment) {
      throw new NotFoundException('blog not found');
    }

    return CommentViewDto.mapToView(comment);
  }

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<Comment> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };
    if (postId) {
      await this.postsRepository.findOrNotFoundFail(postId);
      filter.postId = postId;
    }

    const comment = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const items = comment.map(CommentViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
  async findCommentById(id: string): Promise<CommentViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('comment not found');
    }
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return CommentViewDto.mapToView(comment);
  }
}
