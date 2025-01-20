import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { Post, PostModelType } from '../domain/posts.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);

    const post = this.PostModel.createInstance({
      title: dto.title,
      content: dto.content,
      blogId: dto.blogId,
      shortDescription: dto.shortDescription,
      blogName: blog!.name,
    });
    await this.postsRepository.save(post);
    return post._id.toString();
  }
  async updatePost(id: string, body: UpdatePostDto): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(body);
    await this.postsRepository.save(post);
  }
  async deletePost(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('post not found');
    }
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
