import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVnpayUrl } from '@/lib/vnpay'
import { withAuth } from '@/middleware/auth'

// POST /api/payment/vnpay - Tạo URL thanh toán VNPAY
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { orderId, returnUrl } = await req.json()

    // Kiểm tra đơn hàng có tồn tại và thuộc về user không
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.userId,
        status: 'PENDING'
      },
      include: {
        items: true,
        payment: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Đơn hàng không tồn tại hoặc không thể thanh toán' },
        { status: 404 }
      )
    }

    // Kiểm tra đã có thanh toán chưa
    if (order.payment) {
      return NextResponse.json(
        { error: 'Đơn hàng đã được thanh toán' },
        { status: 400 }
      )
    }

    // Lấy IP address của client
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Tạo thông tin đơn hàng cho VNPAY
    const orderInfo = `Thanh toan don hang #${order.orderCode} - Emo Nong San`
    
    // Tạo URL thanh toán VNPAY
    const vnpayUrl = createVnpayUrl({
      orderId: order.id,
      amount: Number(order.totalAmount),
      orderInfo,
      returnUrl: returnUrl || process.env.VNPAY_RETURN_URL || '',
      ipAddress
    })

    // Tạo payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'VNPAY',
        amount: order.totalAmount,
        currency: 'VND',
        status: 'PENDING'
      }
    })

    // Tạo VNPAY transaction record
    const txnRef = vnpayUrl.split('vnp_TxnRef=')[1]?.split('&')[0] || ''
    await prisma.vnpayTransaction.create({
      data: {
        paymentId: payment.id,
        vnpTxnRef: txnRef,
        returnParamsRaw: JSON.stringify({ orderId, returnUrl })
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: vnpayUrl,
      paymentId: payment.id
    })

  } catch (error) {
    console.error('Lỗi tạo thanh toán VNPAY:', error)
    return NextResponse.json(
      { error: 'Lỗi tạo thanh toán' },
      { status: 500 }
    )
  }
})
