//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger

export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

/*export class CreateCommentForPostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}*/
