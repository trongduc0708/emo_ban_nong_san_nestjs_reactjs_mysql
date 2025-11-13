import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

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
    const targetOffsetMinutes = 7 * 60; // GMT+7
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const vietnamTime = new Date(utcTime + targetOffsetMinutes * 60000);
    const expireMinutes = Number(process.env.EMO_VNPAY_EXPIRE_MINUTES || 15);
    const expireTime = new Date(vietnamTime.getTime() + expireMinutes * 60 * 1000);

    const toVnpDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };
    const createDate = toVnpDate(vietnamTime);
    const expireDate = toVnpDate(expireTime);

    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: String(Math.round(Number(amount) * 100)), // VNPay expects amount in cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      // VNPay often expects OrderInfo to be URL-safe; we follow user's working impl using base64
      vnp_OrderInfo: Buffer.from(orderDescription, 'utf-8').toString('base64'),
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: config.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };
    
    console.log('🔍 VNPay Params:', vnp_Params);

    // Sort parameters
    const sortedParams = this.sortObject(vnp_Params);
    console.log('🔍 Sorted Params:', sortedParams);
    
    // Create query string
    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => str,
    });
    console.log('🔍 Sign Data:', signData);
    
    // Create secure hash
    const secureHash = crypto
      .createHmac('sha512', config.hashSecret)
      .update(signData, 'utf-8')
      .digest('hex');
    console.log('🔍 Secure Hash:', secureHash);

    const responseParams = {
      ...sortedParams,
      vnp_SecureHashType: 'HMACSHA512',
      vnp_SecureHash: secureHash,
    };

    const finalUrl = `${config.vnpayUrl}?${querystring.stringify(responseParams)}`;
    console.log('🔍 Final VNPay URL:', finalUrl);
    
    return finalUrl;
  }

  verifyReturnUrl(vnp_Params: any): { isValid: boolean; orderId?: string; amount?: number } {
    const config = this.config;
    
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => str,
    });
    
    const checkSum = crypto
      .createHmac('sha512', config.hashSecret)
      .update(signData, 'utf-8')
      .digest('hex');

    const isValid = secureHash === checkSum;
    
    if (isValid) {
      return {
        isValid: true,
        orderId: vnp_Params['vnp_TxnRef'],
        amount: parseInt(vnp_Params['vnp_Amount']) / 100
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
}
