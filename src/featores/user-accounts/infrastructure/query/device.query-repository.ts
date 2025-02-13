import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../../domain/device.entity';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

@Injectable()
export class DeviceQueryRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}
  async getAllSessionsForUser(userId: string): Promise<DeviceViewDto[]> {
    const devise = await this.DeviceModel.find({ userId });
    /*if (!devise) {
      throw NotFoundDomainException.create('device not found');
    }*/
    return devise.map(DeviceViewDto.mapToView);
  }
}
