import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trả về danh sách địa chỉ của user theo userId
   * - Ép kiểu BigInt -> number để trả JSON
   * - Sắp xếp: địa chỉ mặc định trước, sau đó id mới nhất
   */
  async list(userId: number) {
    if (!userId) throw new BadRequestException({ error: 'Thiếu userId' })
    const addresses = await this.prisma.address.findMany({
      where: { userId: BigInt(userId) },
      orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    })
    const data = addresses.map((a) => ({ ...a, id: Number(a.id), userId: Number(a.userId) }))
    return { success: true, data }
  }

  /**
   * Tạo địa chỉ mới cho user
   * - Validate dữ liệu bắt buộc
   * - Nếu isDefault = true: hạ cờ mặc định các địa chỉ khác
   */
  async create(userId: number, dto: any) {
    if (!userId) throw new BadRequestException({ error: 'Thiếu userId' })
    const {
      recipientName, phone, province, district, ward, addressLine, isDefault = false,
    } = dto
    if (!recipientName || !phone || !province || !district || !ward || !addressLine)
      throw new BadRequestException({ error: 'Thiếu dữ liệu' })

    if (isDefault) {
      await this.prisma.address.updateMany({ where: { userId: BigInt(userId) }, data: { isDefault: false } })
    }

    const created = await this.prisma.address.create({
      data: {
        userId: BigInt(userId),
        recipientName, phone, province, district, ward, addressLine,
        isDefault: !!isDefault,
      },
    })
    return { success: true, id: Number(created.id) }
  }

  /**
   * Cập nhật địa chỉ theo id (chỉ địa chỉ thuộc user)
   * - Partial update
   * - Hỗ trợ đặt lại địa chỉ mặc định
   */
  async update(userId: number, id: number, dto: any) {
    if (!userId || !id) throw new BadRequestException({ error: 'Thiếu dữ liệu' })

    const address = await this.prisma.address.findFirst({ where: { id: BigInt(id), userId: BigInt(userId) } })
    if (!address) throw new BadRequestException({ error: 'Địa chỉ không tồn tại' })

    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId: BigInt(userId) }, data: { isDefault: false } })
    }

    await this.prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        recipientName: dto.recipientName ?? address.recipientName,
        phone: dto.phone ?? address.phone,
        province: dto.province ?? address.province,
        district: dto.district ?? address.district,
        ward: dto.ward ?? address.ward,
        addressLine: dto.addressLine ?? address.addressLine,
        isDefault: dto.isDefault ?? address.isDefault,
      },
    })
    return { success: true }
  }

  /**
   * Xóa địa chỉ theo id (chỉ địa chỉ thuộc user)
   */
  async remove(userId: number, id: number) {
    if (!userId || !id) throw new BadRequestException({ error: 'Thiếu dữ liệu' })
    const address = await this.prisma.address.findFirst({ where: { id: BigInt(id), userId: BigInt(userId) } })
    if (!address) throw new BadRequestException({ error: 'Địa chỉ không tồn tại' })
    await this.prisma.address.delete({ where: { id: BigInt(id) } })
    return { success: true }
  }
}


