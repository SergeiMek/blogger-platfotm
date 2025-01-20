//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateBlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}
export class CreateBlogForPostDto {
  title: string;
  shortDescription: string;
  content: string;
}
