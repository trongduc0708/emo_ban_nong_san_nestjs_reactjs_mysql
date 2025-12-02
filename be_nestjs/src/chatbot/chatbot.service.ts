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

  async chat(message: string, userId?: number): Promise<{ message: string; products?: any[] }> {
    try {
      // Kiểm tra API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
        this.logger.warn('OpenAI API key is not configured');
        return await this.getFallbackResponse(message);
      }

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

      const responseMessage = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      
      // Kiểm tra xem message có liên quan đến tìm kiếm sản phẩm không
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('tìm') || lowerMessage.includes('sản phẩm') || lowerMessage.includes('mua') || lowerMessage.includes('có gì')) {
        const searchQuery = message.replace(/tìm|sản phẩm|mua|về|có gì|/gi, '').trim() || message;
        const products = await this.searchProducts(searchQuery);
        if (products.length > 0) {
          return {
            message: responseMessage,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: p.category?.name,
              image: p.images?.[0]?.imageUrl,
            })),
          };
        }
      }
      
      return { message: responseMessage };
    } catch (error: any) {
      this.logger.error('Error in chat:', error);
      
      // Xử lý các lỗi cụ thể từ OpenAI API
      if (error?.status === 429) {
        if (error?.code === 'insufficient_quota' || error?.error?.code === 'insufficient_quota') {
          this.logger.warn('OpenAI API quota exceeded, using fallback response');
          return await this.getFallbackResponse(message);
        }
        return { message: 'Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau vài phút.' };
      }

      if (error?.status === 401) {
        return { message: 'Lỗi: OpenAI API key không hợp lệ. Vui lòng kiểm tra cấu hình.' };
      }

      if (error?.message?.includes('API key') || error?.message?.includes('Invalid API key')) {
        return { message: 'Lỗi: Chưa cấu hình OpenAI API key. Vui lòng thêm OPENAI_API_KEY vào file .env' };
      }

      // Fallback cho các lỗi khác
      this.logger.warn('OpenAI API error, using fallback response');
      return await this.getFallbackResponse(message);
    }
  }

  private async getFallbackResponse(message: string): Promise<{ message: string; products?: any[] }> {
    try {
      const lowerMessage = message.toLowerCase().trim();
      
      // Chào hỏi
      if (lowerMessage.includes('xin chào') || lowerMessage.includes('chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return { message: 'Xin chào! Tôi là trợ lý AI của Emo Nông Sản. Tôi có thể giúp bạn tìm kiếm sản phẩm, xem thông tin đơn hàng và trả lời các câu hỏi. Bạn cần hỗ trợ gì?' };
      }

      // Tìm kiếm sản phẩm
      if (lowerMessage.includes('tìm') || lowerMessage.includes('sản phẩm') || lowerMessage.includes('mua') || lowerMessage.includes('có gì')) {
        const searchQuery = message.replace(/tìm|sản phẩm|mua|về|có gì|/gi, '').trim() || message;
        const products = await this.searchProducts(searchQuery);
        if (products.length > 0) {
          const productList = products.map(p => `- ${p.name} (${p.category?.name || 'Chưa phân loại'})`).join('\n');
          return {
            message: `Tôi tìm thấy ${products.length} sản phẩm phù hợp:\n${productList}`,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: p.category?.name,
              image: p.images?.[0]?.imageUrl,
            })),
          };
        }
        return { message: 'Tôi có thể giúp bạn tìm kiếm sản phẩm. Vui lòng cho tôi biết bạn đang tìm sản phẩm gì?' };
      }

      // Câu hỏi về đơn hàng
      if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order')) {
        return { message: 'Để kiểm tra đơn hàng, bạn vui lòng đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi" hoặc liên hệ hotline để được hỗ trợ.' };
      }

      // Câu hỏi về giá
      if (lowerMessage.includes('giá') || lowerMessage.includes('price') || lowerMessage.includes('bao nhiêu')) {
        return { message: 'Giá sản phẩm được hiển thị trên từng trang sản phẩm. Bạn có thể xem chi tiết giá và các biến thể sản phẩm khi xem thông tin sản phẩm.' };
      }

      // Câu hỏi về giao hàng
      if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') || lowerMessage.includes('vận chuyển')) {
        return { message: 'Chúng tôi giao hàng toàn quốc. Phí vận chuyển và thời gian giao hàng phụ thuộc vào địa chỉ nhận hàng. Bạn có thể xem chi tiết khi đặt hàng.' };
      }

      // Câu hỏi về thanh toán
      if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment') || lowerMessage.includes('trả tiền')) {
        return { message: 'Chúng tôi hỗ trợ nhiều phương thức thanh toán: thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và ví điện tử.' };
      }

      // Câu hỏi chung
      return { message: 'Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn:\n- Tìm kiếm sản phẩm\n- Xem thông tin đơn hàng\n- Tư vấn về sản phẩm\n- Hỗ trợ về giao hàng và thanh toán\n\nBạn cần hỗ trợ gì cụ thể?' };
    } catch (error) {
      this.logger.error('Error in fallback response:', error);
      return { message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline để được hỗ trợ.' };
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

