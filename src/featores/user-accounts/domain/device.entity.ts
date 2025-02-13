import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreateDeviceDomainDto,
  UpdateDeviceDto,
} from './dto/create-device.domain.dto';

@Schema({ timestamps: true })
export class Device {
  @Prop({
    type: String,
    required: true,
  })
  ip: string;
  @Prop({
    type: String,
    required: true,
  })
  title: string;
  @Prop({
    type: String,
    required: true,
  })
  userId: string;
  @Prop({
    type: String,
    required: true,
  })
  deviceId: string;

  @Prop({
    type: Number,
    required: true,
  })
  lastActiveDate: number;

  @Prop({
    type: Number,
    required: true,
  })
  expirationDate: number;

  static createInstance(dto: CreateDeviceDomainDto): DeviceDocument {
    const device = new this();
    device.deviceId = dto.deviceId;
    device.userId = dto.userId;
    device.ip = dto.ip;
    device.title = dto.userAgent;
    device.expirationDate = dto.expirationDate;
    device.lastActiveDate = dto.issuedAt;
    return device as DeviceDocument;
  }

  updateDevise(dto: UpdateDeviceDto) {
    this.ip = dto.ip;
    this.lastActiveDate = dto.newIssuedAt;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.loadClass(Device);
export type DeviceDocument = HydratedDocument<Device>;
export type DeviceModelType = Model<DeviceDocument> & typeof Device;
