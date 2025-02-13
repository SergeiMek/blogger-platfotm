import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async findOrNotFoundFail(id: string): Promise<DeviceDocument> {
    const device = await this.DeviceModel.findOne({
      deviceId: id,
    });

    if (!device) {
      throw new NotFoundException('user not found');
    }

    return device;
  }
  async save(device: DeviceDocument) {
    await device.save();
  }
  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteOne({ deviceId: id });
    return result.deletedCount === 1;
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return this.DeviceModel.findOne({ deviceId });
  }

  async deleteAllOldDevices(currentDeviceId: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteMany({
      deviceId: { $ne: currentDeviceId },
    });
    return result.acknowledged;
  }
}
