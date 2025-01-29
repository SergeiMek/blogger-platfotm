import { UserDocument } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  /*get id() {
    // @ts-ignore
    return this._id.toString();
  }*/
  //firstName: string;
  //lastName: string | null;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.accountData.email;
    dto.login = user.accountData.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;

    return dto;
  }
}

export class MeViewDto {
  email: string;
  login: string;
  userId: string;
  static mapToView(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.accountData.email;
    dto.login = user.accountData.login;
    dto.userId = user._id.toString();
    return dto;
  }
}
