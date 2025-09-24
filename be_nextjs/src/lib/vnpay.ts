import crypto from 'crypto'

// Cấu hình VNPAY
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || ''
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || ''
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || ''
const VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || ''

// Interface cho VNPAY parameters
interface VnpayParams {
  vnp_Version: string
  vnp_Command: string
  vnp_TmnCode: string
  vnp_Locale: string
  vnp_CurrCode: string
  vnp_TxnRef: string
  vnp_OrderInfo: string
  vnp_OrderType: string
  vnp_Amount: number
  vnp_ReturnUrl: string
  vnp_IpAddr: string
  vnp_CreateDate: string
  vnp_SecureHash?: string
}

// Tạo mã giao dịch duy nhất
export function generateTxnRef(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `EMO${timestamp}${random}`
}

// Tạo URL thanh toán VNPAY
export function createVnpayUrl(params: {
  orderId: number
  amount: number
  orderInfo: string
  returnUrl: string
  ipAddress: string
}): string {
  const {
    orderId,
    amount,
    orderInfo,
    returnUrl,
    ipAddress
  } = params

  // Tạo mã giao dịch
  const txnRef = generateTxnRef()
  
  // Tạo ngày giờ hiện tại theo format VNPAY
  const createDate = new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0]
  
  // Số tiền phải nhân 100 (theo spec VNPAY)
  const vnpAmount = Math.round(amount * 100)

  // Tạo object parameters
  const vnpayParams: VnpayParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: vnpAmount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddress,
    vnp_CreateDate: createDate
  }

  // Sắp xếp parameters theo alphabet
  const sortedParams = Object.keys(vnpayParams)
    .sort()
    .reduce((result, key) => {
      result[key] = vnpayParams[key as keyof VnpayParams]
      return result
    }, {} as Record<string, any>)

  // Tạo query string
  const queryString = Object.keys(sortedParams)
    .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&')

  // Tạo secure hash
  const secureHash = crypto
    .createHmac('sha512', VNPAY_HASH_SECRET)
    .update(queryString)
    .digest('hex')

  // Thêm secure hash vào parameters
  const finalParams = {
    ...sortedParams,
    vnp_SecureHash: secureHash
  }

  // Tạo URL cuối cùng
  const finalQueryString = Object.keys(finalParams)
    .map(key => `${key}=${encodeURIComponent(finalParams[key])}`)
    .join('&')

  return `${VNPAY_URL}?${finalQueryString}`
}

// Xác thực secure hash từ VNPAY callback
export function verifyVnpaySecureHash(params: Record<string, any>): boolean {
  try {
    const { vnp_SecureHash, ...otherParams } = params
    
    if (!vnp_SecureHash) {
      return false
    }

    // Sắp xếp parameters (loại bỏ vnp_SecureHash)
    const sortedParams = Object.keys(otherParams)
      .sort()
      .reduce((result, key) => {
        if (otherParams[key] !== null && otherParams[key] !== undefined && otherParams[key] !== '') {
          result[key] = otherParams[key]
        }
        return result
      }, {} as Record<string, any>)

    // Tạo query string
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&')

    // Tạo secure hash
    const secureHash = crypto
      .createHmac('sha512', VNPAY_HASH_SECRET)
      .update(queryString)
      .digest('hex')

    // So sánh với hash từ VNPAY
    return secureHash === vnp_SecureHash
  } catch (error) {
    console.error('Lỗi xác thực VNPAY hash:', error)
    return false
  }
}

// Xử lý kết quả thanh toán từ VNPAY
export function processVnpayResult(params: Record<string, any>): {
  success: boolean
  message: string
  transactionId?: string
  amount?: number
} {
  const { vnp_ResponseCode, vnp_TransactionNo, vnp_Amount, vnp_TxnRef } = params

  // Mã phản hồi 00 = thành công
  if (vnp_ResponseCode === '00') {
    return {
      success: true,
      message: 'Thanh toán thành công',
      transactionId: vnp_TransactionNo,
      amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : undefined
    }
  }

  // Các mã lỗi khác
  const errorMessages: Record<string, string> = {
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
    '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
    '13': 'Nhập sai mã xác thực (OTP). Quý khách vui lòng thực hiện lại giao dịch',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định. Quý khách vui lòng thực hiện lại giao dịch'
  }

  return {
    success: false,
    message: errorMessages[vnp_ResponseCode] || 'Giao dịch không thành công'
  }
}
