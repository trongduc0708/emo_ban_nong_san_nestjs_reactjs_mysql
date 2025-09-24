import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyVnpaySecureHash, processVnpayResult } from '@/lib/vnpay'

// GET /api/payment/vnpay-return - Xử lý callback từ VNPAY
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())

    // Xác thực secure hash
    if (!verifyVnpaySecureHash(params)) {
      return NextResponse.json(
        { error: 'Xác thực thanh toán thất bại' },
        { status: 400 }
      )
    }

    // Xử lý kết quả thanh toán
    const result = processVnpayResult(params)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message
      })
    }

    // Tìm payment record
    const vnpayTransaction = await prisma.vnpayTransaction.findFirst({
      where: {
        vnpTxnRef: params.vnp_TxnRef
      },
      include: {
        payment: {
          include: {
            order: true
          }
        }
      }
    })

    if (!vnpayTransaction) {
      return NextResponse.json(
        { error: 'Không tìm thấy giao dịch' },
        { status: 404 }
      )
    }

    // Cập nhật trạng thái thanh toán
    await prisma.payment.update({
      where: { id: vnpayTransaction.paymentId },
      data: {
        status: 'SUCCESS',
        paidAt: new Date()
      }
    })

    // Cập nhật trạng thái đơn hàng
    await prisma.order.update({
      where: { id: vnpayTransaction.payment.orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      }
    })

    // Cập nhật thông tin VNPAY transaction
    await prisma.vnpayTransaction.update({
      where: { id: vnpayTransaction.id },
      data: {
        vnpTransactionNo: params.vnp_TransactionNo,
        vnpAmount: parseInt(params.vnp_Amount || '0'),
        vnpBankCode: params.vnp_BankCode,
        vnpResponseCode: params.vnp_ResponseCode,
        vnpOrderInfo: params.vnp_OrderInfo,
        vnpPayDate: params.vnp_PayDate,
        vnpSecureHash: params.vnp_SecureHash,
        returnParamsRaw: JSON.stringify(params)
      }
    })

    // Redirect về trang kết quả thanh toán
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const redirectUrl = `${frontendUrl}/payment/success?orderId=${vnpayTransaction.payment.orderId}`

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Lỗi xử lý VNPAY return:', error)
    
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const redirectUrl = `${frontendUrl}/payment/error`

    return NextResponse.redirect(redirectUrl)
  }
}
