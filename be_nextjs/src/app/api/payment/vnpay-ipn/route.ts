import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyVnpaySecureHash, processVnpayResult } from '@/lib/vnpay'

// POST /api/payment/vnpay-ipn - Xử lý IPN từ VNPAY (Server-to-Server)
export async function POST(req: NextRequest) {
  try {
    const params = await req.json()

    // Xác thực secure hash
    if (!verifyVnpaySecureHash(params)) {
      return NextResponse.json(
        { error: 'Xác thực IPN thất bại' },
        { status: 400 }
      )
    }

    // Xử lý kết quả thanh toán
    const result = processVnpayResult(params)
    
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

    // Cập nhật thông tin IPN
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
        ipnParamsRaw: JSON.stringify(params)
      }
    })

    // Nếu thanh toán thành công, cập nhật trạng thái
    if (result.success) {
      await prisma.payment.update({
        where: { id: vnpayTransaction.paymentId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date()
        }
      })

      await prisma.order.update({
        where: { id: vnpayTransaction.payment.orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      })
    } else {
      // Thanh toán thất bại
      await prisma.payment.update({
        where: { id: vnpayTransaction.paymentId },
        data: {
          status: 'FAILED'
        }
      })

      await prisma.order.update({
        where: { id: vnpayTransaction.payment.orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      })
    }

    // Trả về response cho VNPAY
    return NextResponse.json({
      RspCode: '00',
      Message: 'Success'
    })

  } catch (error) {
    console.error('Lỗi xử lý VNPAY IPN:', error)
    
    return NextResponse.json(
      { RspCode: '99', Message: 'Error' },
      { status: 500 }
    )
  }
}
