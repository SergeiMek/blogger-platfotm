//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger

import { IsEnum, IsString, Length } from 'class-validator';

export enum likeStatusEnum {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class CreateCommentInputDto {
  content: string;
  postId: string;
}

export class UpdateCommentInputDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
export class UpdateLikeStatusInputDto {
  @IsEnum(likeStatusEnum)
  likeStatus: 'None' | 'Like' | 'Dislike';
}
