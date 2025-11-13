import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);

  constructor(private configService: ConfigService) {}

  private getConfig(): {
    tmnCode: string
    hashSecret: string
    vnpayUrl: string
    returnUrl: string
    ipnUrl: string
  } {
    const config: {
      tmnCode?: string
      hashSecret?: string
      vnpayUrl?: string
      returnUrl?: string
      ipnUrl?: string
    } = {
      tmnCode: this.configService.get<string>('EMO_VNPAY_TMN_CODE') || this.configService.get<string>('VNPAY_TMN_CODE'),
      hashSecret:
        this.configService.get<string>('EMO_VNPAY_HASH_SECRET') ||
        this.configService.get<string>('VNPAY_HASH_SECRET'),
      vnpayUrl: this.configService.get<string>('EMO_VNPAY_URL') || this.configService.get<string>('VNPAY_URL'),
      returnUrl:
        this.configService.get<string>('EMO_VNPAY_RETURN_URL') ||
        this.configService.get<string>('VNPAY_RETURN_URL'),
      ipnUrl:
        this.configService.get<string>('EMO_VNPAY_IPN_URL') || this.configService.get<string>('VNPAY_IPN_URL'),
    };

    this.logger.debug(
      `VNPay Config Loaded -> TMN:${config.tmnCode ? 'SET' : 'MISSING'}, HASH:${config.hashSecret ? 'SET' : 'MISSING'}, URL:${
        config.vnpayUrl ? 'SET' : 'MISSING'
      }, RETURN:${config.returnUrl ? 'SET' : 'MISSING'}, IPN:${config.ipnUrl ? 'SET' : 'MISSING'}`,
    );

    if (!config.tmnCode || !config.hashSecret || !config.vnpayUrl) {
      throw new Error('Missing VNPay configuration. Please ensure the required environment variables are set.');
    }

    return config as {
      tmnCode: string
      hashSecret: string
      vnpayUrl: string
      returnUrl: string
      ipnUrl: string
    };
  }

  createPaymentUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string): string {
    const config = this.getConfig();
    
    console.log('🔍 Creating VNPay URL with params:');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);
    console.log('Order Info:', orderInfo);
    console.log('IP Address:', ipAddr);
    
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: amount * 100, // VNPay expects amount in cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
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
    const queryString = querystring.stringify(sortedParams);
    console.log('🔍 Query String:', queryString);
    
    // Create secure hash
    const secureHash = crypto
      .createHmac('sha512', config.hashSecret)
      .update(queryString)
      .digest('hex');
    console.log('🔍 Secure Hash:', secureHash);

    const finalUrl = `${config.vnpayUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
    console.log('🔍 Final VNPay URL:', finalUrl);
    
    return finalUrl;
  }

  verifyReturnUrl(vnp_Params: any): { isValid: boolean; orderId?: string; amount?: number } {
    const config = this.getConfig();
    
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const queryString = querystring.stringify(sortedParams);
    
    const checkSum = crypto
      .createHmac('sha512', config.hashSecret)
      .update(queryString)
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
