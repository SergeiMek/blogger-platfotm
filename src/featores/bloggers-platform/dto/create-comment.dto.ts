export class CreateCommentDto {
  userId: string;
  content: string;
  postId: string;
}

export class UpdateCommentDto {
  userId: string;
  commentId: string;
  content: string;
}
