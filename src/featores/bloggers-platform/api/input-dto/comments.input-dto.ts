//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger

export class CreateCommentInputDto {
  content: string;
  postId: string;
}

export class UpdateCommentDto {
  content: string;
}
