import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import { add } from 'date-fns';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

@Schema()
class AccountData {
  @Prop({ type: String, required: true, unique: true })
  login: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true, unique: true })
  passwordHash: string;
  @Prop({ type: String, required: true })
  passwordSalt: string;
}

@Schema()
class EmailConfirmation {
  @Prop({ type: String, default: null })
  confirmationCode: string;
  @Prop({ type: Date, default: null })
  expirationData: Date;
  @Prop({ type: Boolean, required: true, default: true })
  isConfirmed: boolean;
}

@Schema()
class PasswordRecovery {
  @Prop({ type: String, default: null })
  recoveryCode: string;
  @Prop({ type: Date, default: null })
  expirationDate: Date;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: AccountDataSchema,
    required: true,
    default: new AccountData(),
  })
  accountData: AccountData;
  @Prop({
    type: EmailConfirmationSchema,
    required: true,
    default: new EmailConfirmation(),
  })
  emailConfirmation: EmailConfirmation;
  @Prop({
    type: PasswordRecoverySchema,
    required: true,
    default: new EmailConfirmation(),
  })
  passwordRecovery: PasswordRecovery;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;
  createdAt: Date;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.accountData.email = dto.email;
    user.accountData.login = dto.login;
    user.accountData.passwordHash = dto.passwordHash;
    user.accountData.passwordSalt = dto.passwordSalt;
    return user as UserDocument;
  }

  setConfirmationCode(confirmCode: string) {
    this.emailConfirmation.confirmationCode = confirmCode;
    this.emailConfirmation.isConfirmed = false;
    this.emailConfirmation.expirationData = add(new Date(), { hours: 1 });
  }
  updatePasswordRecoveryData(expirationDate: Date, recoveryCode: string) {
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = expirationDate;
  }
  updatePassword(passwordSalt: string, passwordHash: string) {
    this.accountData.passwordSalt = passwordSalt;
    this.accountData.passwordHash = passwordHash;
  }
  updateConfirmationStatus() {
    this.emailConfirmation.isConfirmed = true;
  }
  updateConfirmationCode(code: string) {
    this.emailConfirmation.confirmationCode = code;
  }
  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
