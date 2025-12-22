import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VnpayService {
  private tmnCode: string;
  private hashSecret: string;
  private vnpUrl: string;
  private returnUrl: string;

  constructor(private configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('EMO_VNPAY_TMN_CODE')!;
    this.hashSecret = this.configService.get<string>('EMO_VNPAY_HASH_SECRET')!;
    this.vnpUrl =
      this.configService.get<string>('EMO_VNPAY_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.returnUrl =
      this.configService.get<string>('EMO_VNPAY_RETURN_URL')!;

    if (!this.tmnCode || !this.hashSecret || !this.returnUrl) {
      throw new Error('VNPay config missing');
    }
  }

  createPaymentUrl(
    orderCode: string,
    amount: number,
    orderInfo: string,
    ipAddr: string,
  ): string {
    const clientIp =
      ipAddr && ipAddr.includes(':') ? '127.0.0.1' : ipAddr;

    const createDate = this.formatDate(new Date());

    let params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderCode,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: createDate,
    };

    // 1️⃣ SORT KEY
    const sortedKeys = Object.keys(params).sort();

    // 2️⃣ ENCODE VALUE TRƯỚC
    const encodedParams: Record<string, string> = {};
    for (const key of sortedKeys) {
      encodedParams[key] = encodeURIComponent(params[key]);
    }

    // 3️⃣ BUILD STRING TO SIGN (ENCODED)
    const signData = sortedKeys
      .map((key) => `${key}=${encodedParams[key]}`)
      .join('&');

    // 4️⃣ SIGN SHA512
    const secureHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(signData, 'utf8')
      .digest('hex');

    // 5️⃣ ADD HASH
    encodedParams['vnp_SecureHash'] = secureHash;

    // 6️⃣ FINAL SORT
    const finalQuery = Object.keys(encodedParams)
      .sort()
      .map((key) => `${key}=${encodedParams[key]}`)
      .join('&');

    return `${this.vnpUrl}?${finalQuery}`;
  }


  verifyReturnUrl(vnpParams: Record<string, any>) {
    const secureHash = vnpParams['vnp_SecureHash'];
    
    // Create a cleanup copy for signature verification
    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedKeys = Object.keys(params).sort();

    let signData = '';
    for (const key of sortedKeys) {
      signData += `${key}=${params[key]}&`;
    }
    signData = signData.slice(0, -1);

    const checkHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(signData, 'utf8')
      .digest('hex');

    const isValid = secureHash === checkHash;

    return {
      isValid,
      orderId: params['vnp_TxnRef'],
      amount: Number(params['vnp_Amount']) / 100, // VNPAY amount is multiplied by 100
      transactionNo: params['vnp_TransactionNo'],
      bankCode: params['vnp_BankCode'],
      payDate: params['vnp_PayDate'],
      responseCode: params['vnp_ResponseCode']
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }

  // =========================
  // SUPPORTED BANKS
  // =========================
  getSupportedBanks() {
    return [
      { code: 'VNPAYQR', name: 'Thanh toán QR Code' },
      { code: 'VNBANK', name: 'ATM / Ngân hàng nội địa' },
      { code: 'INTCARD', name: 'Thẻ quốc tế' },
      { code: 'NCB', name: 'Ngân hàng NCB' },
      { code: 'SACOMBANK', name: 'Sacombank' },
      { code: 'EXIMBANK', name: 'Eximbank' },
      { code: 'MSBANK', name: 'MSBank' },
      { code: 'NAMABANK', name: 'Nam A Bank' },
      { code: 'VIETINBANK', name: 'VietinBank' },
      { code: 'VIETCOMBANK', name: 'Vietcombank' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'TECHCOMBANK', name: 'Techcombank' },
      { code: 'VPBANK', name: 'VPBank' },
      { code: 'AGRIBANK', name: 'Agribank' },
      { code: 'MBBANK', name: 'MB Bank' },
      { code: 'ACB', name: 'ACB' },
    ];
  }
}
