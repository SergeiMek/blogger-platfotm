import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/device.entity';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceTdo } from '../../bloggers-platform/dto/create-device.tdo';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private DevicesModel: DeviceModelType,
    private devicesRepository: DevicesRepository,
    private jwtService: JwtService,
  ) {}

  async createDevice(dto: CreateDeviceTdo) {
    const newRefreshTokenObj = await this.jwtService.verify(
      dto.newRefreshToken,
    );
    if (!newRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    const userId = newRefreshTokenObj.id;
    const deviceId = newRefreshTokenObj.deviceId;
    const expirationDate = newRefreshTokenObj.exp;
    const issuedAt = newRefreshTokenObj.iat;
    const devise = this.DevicesModel.createInstance({
      deviceId,
      issuedAt,
      userId,
      userAgent: dto.userAgent,
      expirationDate,
      ip: dto.ip,
    });
    await this.devicesRepository.save(devise);
  }

  async deleteDeviceById(
    deviceId: string,
    refreshToken: string,
  ): Promise<void> {
    const findDevise = await this.findDeviceByDeviceId(deviceId);
    if (!findDevise) {
      throw NotFoundDomainException.create('device not found');
      //throw UnauthorizedDomainException.create();
    }
    const cookieRefreshTokenObj = await this.jwtService.verify(refreshToken);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    const deviceUserId = findDevise.userId;
    const cookieUserId = cookieRefreshTokenObj.id;
    if (deviceUserId !== cookieUserId) {
      throw ForbiddenDomainException.create('the device does not belong to yo');
    }
    await this.devicesRepository.deleteDevice(deviceId);
  }

  async findDeviceByDeviceId(deviceId: string): Promise<null | DeviceDocument> {
    return await this.devicesRepository.findDeviceByDeviceId(deviceId);
  }

  /*  async updateDevice(
    ip: string,
    deviceId: string,
    issuedAt: number,
  ): Promise<boolean> {
    return await this.devicesRepository.updateDevice(ip, deviceId, issuedAt);
  }*/

  async deleteAllOldDevices(currentDeviceToken: string): Promise<void> {
    const cookieRefreshTokenObj =
      await this.jwtService.verify(currentDeviceToken);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    await this.devicesRepository.deleteAllOldDevices(
      cookieRefreshTokenObj.deviceId,
    );
  }
}
