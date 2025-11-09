import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async chat(message: string, userId?: number): Promise<string> {
    try {
      // Lấy thông tin database context
      const dbContext = await this.getDatabaseContext();

      // Tạo system prompt với thông tin database
      const systemPrompt = `Bạn là trợ lý AI thông minh cho website bán nông sản "Emo Nông Sản". 
Bạn có thể trả lời các câu hỏi về sản phẩm, danh mục, đơn hàng và các thông tin khác dựa trên dữ liệu thực tế từ database.

THÔNG TIN DATABASE HIỆN TẠI:
${dbContext}

HƯỚNG DẪN:
- Trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp
- Sử dụng thông tin từ database để trả lời chính xác
- Nếu không có thông tin trong database, hãy nói rõ ràng
- Đề xuất sản phẩm phù hợp khi được hỏi
- Hỗ trợ tìm kiếm sản phẩm theo danh mục, giá, hoặc tên
- Giải thích về chính sách giao hàng, thanh toán nếu được hỏi
- Luôn lịch sự và nhiệt tình`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
    } catch (error) {
      this.logger.error('Error in chat:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return 'Lỗi: Chưa cấu hình OpenAI API key. Vui lòng thêm OPENAI_API_KEY vào file .env';
        }
      }
      return 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }

  private async getDatabaseContext(): Promise<string> {
    try {
      // Lấy thông tin tổng quan về database
      const [
        totalProducts,
        totalCategories,
        totalOrders,
        activeProducts,
        categories,
        topProducts,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.category.count(),
        this.prisma.order.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.category.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
          take: 10,
        }),
        this.prisma.product.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            variants: {
              select: { price: true },
              where: { isActive: true },
              take: 1,
              orderBy: { price: 'asc' },
            },
            category: { select: { name: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // Lấy thông tin về đơn hàng gần đây
      const recentOrders = await this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderCode: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      });

      // Format context string
      let context = `TỔNG QUAN:
- Tổng số sản phẩm: ${totalProducts} (${activeProducts} đang hoạt động)
- Tổng số danh mục: ${totalCategories}
- Tổng số đơn hàng: ${totalOrders}

DANH MỤC SẢN PHẨM:
${categories.map((c) => `- ${c.name} (slug: ${c.slug})`).join('\n')}

SẢN PHẨM NỔI BẬT (10 sản phẩm mới nhất):
${topProducts
  .map((p) => {
    const price = p.variants[0]?.price || 0;
    return `- ${p.name} (${p.category?.name || 'Chưa phân loại'}) - Giá: ${Number(price).toLocaleString('vi-VN')} VNĐ - Slug: ${p.slug}`;
  })
  .join('\n')}

ĐƠN HÀNG GẦN ĐÂY (5 đơn hàng mới nhất):
${recentOrders
  .map(
    (o) =>
      `- Mã đơn: ${o.orderCode}, Trạng thái: ${o.status}, Tổng tiền: ${Number(o.totalAmount).toLocaleString('vi-VN')} VNĐ, Ngày: ${new Date(o.createdAt).toLocaleDateString('vi-VN')}`,
  )
  .join('\n')}`;

      return context;
    } catch (error) {
      this.logger.error('Error getting database context:', error);
      return 'Không thể lấy thông tin database.';
    }
  }

  async searchProducts(query: string): Promise<any[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { slug: { contains: query } },
              ],
            },
          ],
        },
        include: {
          category: { select: { name: true } },
          images: { take: 1 },
        },
        take: 5,
      });

      return products;
    } catch (error) {
      this.logger.error('Error searching products:', error);
      return [];
    }
  }

  async getProductInfo(productId: number): Promise<any> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });

      return product;
    } catch (error) {
      this.logger.error('Error getting product info:', error);
      return null;
    }
  }
}

