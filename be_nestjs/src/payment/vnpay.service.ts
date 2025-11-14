import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);
  private config!: {
    tmnCode: string;
    hashSecret: string;
    vnpayUrl: string;
    returnUrl: string;
    ipnUrl: string;
  };

  constructor(private readonly configService: ConfigService) {
    // Initialize after DI has injected ConfigService
    this.config = this.loadConfig();
  }

  private loadConfig() {
    const config = {
      tmnCode: this.configService.get<string>('EMO_VNPAY_TMN_CODE')?.trim(),
      hashSecret: this.configService.get<string>('EMO_VNPAY_HASH_SECRET')?.trim(),
      vnpayUrl: this.configService.get<string>('EMO_VNPAY_URL')?.trim(),
      returnUrl: this.configService.get<string>('EMO_VNPAY_RETURN_URL')?.trim(),
      ipnUrl: this.configService.get<string>('EMO_VNPAY_IPN_URL')?.trim(),
    };

    const missing = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      this.logger.error(
        `VNPay configuration missing: ${missing.join(', ')}. Please verify your environment variables in be_nestjs/.env.`,
      );
      throw new Error('VNPay configuration is incomplete.');
    }

    this.logger.log('VNPay configuration loaded successfully.');
    return config as {
      tmnCode: string;
      hashSecret: string;
      vnpayUrl: string;
      returnUrl: string;
      ipnUrl: string;
    };
  }

  createPaymentUrl(orderId: string, amount: number, orderDescription: string, ipAddr: string): string {
    const config = this.config;
    
    console.log('🔍 Creating VNPay URL with params:');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);
    console.log('Order Info:', orderDescription);
    console.log('IP Address:', ipAddr);
    
    // Use Vietnam timezone (GMT+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const expireMinutesRaw = Number(process.env.EMO_VNPAY_EXPIRE_MINUTES || 15);
    const expireMinutes = Number.isFinite(expireMinutesRaw) && expireMinutesRaw > 0 ? expireMinutesRaw : 15;
    const expireTime = new Date(vietnamTime.getTime() + expireMinutes * 60 * 1000);

    const toVnpDate = (d: Date) => d.toISOString().replace(/[-:T]/g, '').replace(/\..+/, '');
    const createDate = toVnpDate(vietnamTime);
    const expireDate = toVnpDate(expireTime);

    // VNPay thường yêu cầu IPv4, chuyển ::1 thành 127.0.0.1 (nếu cần)
    const clientIp = ipAddr && ipAddr.includes(':') ? '127.0.0.1' : ipAddr || '127.0.0.1';

    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: String(Math.round(Number(amount) * 100)), // VNPay expects amount in cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      // Encode OrderInfo bằng base64 như VNPay yêu cầu
      vnp_OrderInfo: Buffer.from(orderDescription, 'utf-8').toString('base64'),
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: config.returnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };
    
    console.log('🔍 VNPay Params:', vnp_Params);

    // Sort parameters
    const sortedParams = this.sortObject(vnp_Params);
    console.log('🔍 Sorted Params:', sortedParams);
    
    // Create query string
    // VNPay checksum requires URL-encoded key=value pairs joined by '&' in alphabetical order
    const signData = this.buildSignData(vnp_Params);
    console.log('🔍 Sign Data:', signData);
    
    // Create secure hash
    const secureHash = crypto
      .createHmac('sha512', config.hashSecret)
      .update(signData, 'utf-8')
      .digest('hex');
    console.log('🔍 Secure Hash:', secureHash);

    const finalUrl = `${config.vnpayUrl}?${signData}&vnp_SecureHash=${secureHash}`;
    console.log('🔍 Final VNPay URL:', finalUrl);
    
    return finalUrl;
  }

  verifyReturnUrl(vnp_Params: any): { 
    isValid: boolean; 
    orderId?: string; 
    amount?: number;
    responseCode?: string;
    transactionNo?: string;
    bankCode?: string;
    payDate?: string;
  } {
    const config = this.config;
    
    this.logger.log('🔐 VNPay Verify - Original params:', JSON.stringify(vnp_Params));
    
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const signData = this.buildSignData(vnp_Params);
    this.logger.log('🔐 VNPay Verify - Sign data:', signData);
    
    const checkSum = crypto.createHmac('sha512', config.hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    this.logger.log('🔐 VNPay Verify - Generated hash:', checkSum);
    this.logger.log('🔐 VNPay Verify - Received hash:', secureHash);
    this.logger.log('🔐 VNPay Verify - Hash match:', checkSum === secureHash);

    const isValid = secureHash === checkSum;
    
    if (isValid) {
      return {
        isValid: true,
        orderId: vnp_Params['vnp_TxnRef'],
        amount: parseInt(vnp_Params['vnp_Amount'], 10) / 100,
        responseCode: vnp_Params['vnp_ResponseCode'],
        transactionNo: vnp_Params['vnp_TransactionNo'],
        bankCode: vnp_Params['vnp_BankCode'],
        payDate: vnp_Params['vnp_PayDate']
      };
    }

    return { isValid: false };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    
    return sorted;
  }

  private buildSignData(params: Record<string, string>) {
    const sorted = this.sortObject(params);
    return Object.entries(sorted)
      .map(([key, val]) => `${key}=${encodeURIComponent(String(val))}`)
      .join('&');
  }

  // Lấy danh sách ngân hàng hỗ trợ VNPay
  getSupportedBanks() {
    return [
      { code: 'NCB', name: 'Ngân hàng Quốc Dân (NCB)' },
      { code: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
      { code: 'VIETINBANK', name: 'Ngân hàng TMCP Công Thương Việt Nam' },
      { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
      { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
      { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
      { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
      { code: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
      { code: 'DONGABANK', name: 'Ngân hàng TMCP Đông Á' },
      { code: 'EXIMBANK', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam' },
      { code: 'HDBANK', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh' },
      { code: 'MBBANK', name: 'Ngân hàng TMCP Quân đội' },
      { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông' },
      { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' },
      { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam' },
      { code: 'VPBANK', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' }
    ];
  }
}
