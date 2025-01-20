import { CommentDocument } from '../../domain/comments.entity';

/*class usersForLikes {
  addedAt: Date;
  userId: string;
  login: string;
}*/

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();
    debugger;
    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
    return dto;
  }
}
