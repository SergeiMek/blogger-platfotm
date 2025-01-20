import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<string> {
    await this.postsRepository.findOrNotFoundFail(dto.postId);
    const comment = this.CommentModel.createInstance({
      content: dto.content,
      userId: dto.userId,
      postId: dto.postId,
    });
    await this.commentRepository.save(comment);
    return comment._id.toString();
  }
  /* async updateBlog(id: string, body: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.update(body);
    await this.blogsRepository.save(blog);
  }
  async deleteBlog(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('user not found');
    }
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }*/
}
