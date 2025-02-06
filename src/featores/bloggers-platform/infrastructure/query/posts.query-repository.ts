import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../domain/blogs.entity';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsRepository } from '../blogs.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { PostsRepository } from '../posts.repository';
import { getAllPostsDto } from '../../dto/create-post.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('post not found');
    }
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async getAll(dto: getAllPostsDto): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };
    debugger;
    if (dto.blogId) {
      await this.blogsRepository.findOrNotFoundFail(dto.blogId);
      filter.blogId = dto.blogId;
    }
    const post = await this.PostModel.find(filter)
      .sort({ [dto.query.sortBy]: dto.query.sortDirection })
      .skip(dto.query.calculateSkip())
      .limit(dto.query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    /* const items: PostViewDto[] = post.map((post) =>
      PostViewDto.mapToView(post),
    );*/
    /*const newestLikes = post.likesInfo.users
      .filter((p) => p.likeStatus === 'Like')
      .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
      .map((p) => {
        return {
          addedAt: p.addedAt,
          userId: p.userId,
          login: p.userLogin,
        };
      })
      .splice(0, 3);*/

    const items: PostViewDto[] = await Promise.all(
      post.map(async (post) => {
        let status;
        if (dto.userId) {
          status = await this.postsRepository.findUserLikeStatus(
            post._id.toString(),
            dto.userId,
          );
        }
        const newestLikes = post.likesInfo.users
          .filter((p) => p.likeStatus === 'Like')
          .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
          .map((p) => {
            return {
              addedAt: p.addedAt,
              userId: p.userId,
              login: p.userLogin,
            };
          })
          .splice(0, 3);
        return PostViewDto.mapToView(post, newestLikes, status);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: dto.query.pageNumber,
      size: dto.query.pageSize,
    });
  }
  async findPostById(id: string, userId?: string): Promise<PostViewDto> {
    if (!isValidObjectId(id)) {
      throw NotFoundDomainException.create('post not found');
    }
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!post) {
      throw NotFoundDomainException.create('post not found');
    }
    let status;
    if (userId) {
      status = await this.postsRepository.findUserLikeStatus(id, userId);
    }
    const newestLikes = post.likesInfo.users
      .filter((p) => p.likeStatus === 'Like')
      .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
      .map((p) => {
        return {
          addedAt: p.addedAt,
          userId: p.userId,
          login: p.userLogin,
        };
      })
      .splice(0, 3);

    return PostViewDto.mapToView(post, newestLikes, status);
  }
}
