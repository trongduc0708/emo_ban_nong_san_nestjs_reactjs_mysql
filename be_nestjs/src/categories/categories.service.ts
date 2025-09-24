import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    const data = categories.map((c) => ({
      ...c,
      id: Number(c.id),
      parentId: c.parentId ? Number(c.parentId) : null,
    }));

    return { success: true, data };
  }
}


