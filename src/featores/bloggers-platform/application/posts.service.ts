import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreatePostDto,
  updateLikesPostDto,
  UpdatePostDto,
} from '../dto/create-post.dto';
import { Post, PostModelType } from '../domain/posts.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { isValidObjectId } from 'mongoose';
import { UsersRepository } from '../../user-accounts/infrastructure/users.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
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
  async updateLikesStatus(data: updateLikesPostDto): Promise<void> {
    const foundPost = await this.postsRepository.findOrNotFoundFail(
      data.postId,
    );

    let likesCount = foundPost.likesInfo.likesCount;
    let dislikesCount = foundPost.likesInfo.dislikesCount;

    const foundUser = await this.postsRepository.findUserInLikesInfo(
      data.postId,
      data.userId,
    );

    const user = await this.usersRepository.findOrNotFoundFail(data.userId);
    const login = user!.accountData.login;

    const pushData = {
      postId: data.postId,
      userId: data.userId,
      userLogin: login,
      likeStatus: data.likeStatus,
    };
    if (!foundUser) {
      ///  await this.postsRepository.pushUserInLikesInfo(pushData);
      await foundPost.pushUserInLikesInfo(pushData);
      await this.postsRepository.save(foundPost);
      if (data.likeStatus === 'Like') {
        likesCount++;
      }
      if (data.likeStatus === 'Dislike') {
        dislikesCount++;
      }

      await foundPost.updateLikesCount({ dislikesCount, likesCount });
      await this.postsRepository.save(foundPost);
      return;
    }

    const userLikeDBStatus = await this.postsRepository.findUserLikeStatus(
      data.postId,
      data.userId,
    );

    switch (userLikeDBStatus) {
      case 'None':
        if (data.likeStatus === 'Like') {
          likesCount++;
        }

        if (data.likeStatus === 'Dislike') {
          dislikesCount++;
        }
        break;
      case 'Like':
        if (data.likeStatus === 'None') {
          likesCount--;
        }
        if (data.likeStatus === 'Dislike') {
          dislikesCount++;
          likesCount--;
        }
        break;
      case 'Dislike':
        if (data.likeStatus === 'None') {
          dislikesCount--;
        }
        if (data.likeStatus === 'Like') {
          dislikesCount--;
          likesCount++;
        }
    }
    await foundPost.updateLikesCount({ dislikesCount, likesCount });
    await this.postsRepository.save(foundPost);

    await this.postsRepository.updateLikesStatus(
      data.postId,
      data.userId,
      data.likeStatus,
    );

    return;
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
