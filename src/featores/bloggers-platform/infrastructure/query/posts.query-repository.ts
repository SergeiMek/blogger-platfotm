import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../domain/blogs.entity';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { Post, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsRepository } from '../blogs.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
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

    return PostViewDto.mapToView(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (blogId) {
      await this.blogsRepository.findOrNotFoundFail(blogId);
      filter.blogId = blogId;
    }

    const post = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const items: PostViewDto[] = post.map((post) =>
      PostViewDto.mapToView(post),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
  async findPostById(id: string): Promise<PostViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('post not found');
    }
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!post) {
      throw new NotFoundException('blog not found');
    }
    return PostViewDto.mapToView(post);
  }
  /*  async findBlogById(id: string): Promise<BlogViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('user not found');
    }
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!blog) {
      throw new NotFoundException('blog not found');
    }
    return BlogViewDto.mapToView(blog);
  }*/
}
