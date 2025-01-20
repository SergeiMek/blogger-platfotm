import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { CreateCommentInputDto } from './input-dto/comments.input-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  /*@Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }*/

  @Get(':id')
  async getCommentById(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findCommentById(id);
  }

  @Post()
  async createComment(
    @Body() body: CreateCommentInputDto,
  ): Promise<CommentViewDto> {
    const commentDto = {
      ...body,
      userId: '12323',
    };
    const commentId = await this.commentsService.createComment(commentDto);
    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
  }

  /* @Put(':id')
  async updateBlog(
    @Param('id') userId: string,
    @Body() model: UpdateBlogDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(userId, model);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }*/
}
