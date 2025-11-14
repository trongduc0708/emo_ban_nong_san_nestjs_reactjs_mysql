import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Loader2, ShoppingCart, Package } from 'lucide-react'
import { formatPrice } from '@/utils/priceUtils'
import { paymentApi } from '@/services/api'
import toast from 'react-hot-toast'

export default function VNPayReturnPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    message: string
    orderId?: string
    orderCode?: string
    amount?: number
    transactionNo?: string
    bankCode?: string
    payDate?: string
  } | null>(null)

  useEffect(() => {
    handlePaymentReturn()
  }, [])

  const handlePaymentReturn = async () => {
    try {
      setLoading(true)
      
      // Lấy thông tin từ URL parameters
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode')
      const vnp_TxnRef = searchParams.get('vnp_TxnRef')
      const vnp_Amount = searchParams.get('vnp_Amount')
      const vnp_TransactionNo = searchParams.get('vnp_TransactionNo')
      const vnp_SecureHash = searchParams.get('vnp_SecureHash')

      console.log('🔐 VNPay Return - ResponseCode:', vnp_ResponseCode)
      console.log('🔐 VNPay Return - TxnRef:', vnp_TxnRef)
      console.log('🔐 VNPay Return - Amount:', vnp_Amount)
      console.log('🔐 VNPay Return - TransactionNo:', vnp_TransactionNo)

      if (!vnp_TxnRef) {
        setPaymentResult({
          success: false,
          message: 'Không tìm thấy thông tin đơn hàng'
        })
        return
      }

      // Backend đã xử lý và redirect về đây với query params
      // Chúng ta chỉ cần hiển thị kết quả dựa trên responseCode
      
      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        setPaymentResult({
          success: true,
          message: 'Thanh toán thành công! Đơn hàng đã được xác nhận.',
          orderId: vnp_TxnRef,
          orderCode: vnp_TxnRef,
          amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : undefined,
          transactionNo: vnp_TransactionNo || undefined
        })
      } else {
        // Thanh toán thất bại
        const errorMessages: Record<string, string> = {
          '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
          '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
          '10': 'Xác thực giao dịch không thành công do: Nhập sai mật khẩu quá số lần quy định. Xin vui lòng thực hiện lại giao dịch.',
          '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
          '12': 'Thẻ/Tài khoản bị khóa.',
          '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.',
          '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
          '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
          '75': 'Ngân hàng thanh toán đang bảo trì.',
          '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định. Xin vui lòng thực hiện lại giao dịch.',
          '99': 'Lỗi không xác định.'
        }

        setPaymentResult({
          success: false,
          message: errorMessages[vnp_ResponseCode || '99'] || 'Thanh toán thất bại. Vui lòng thử lại.'
        })
      }
    } catch (error) {
      console.error('❌ Error handling payment return:', error)
      setPaymentResult({
        success: false,
        message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleContinueShopping = () => {
    navigate('/products')
  }

  const handleViewOrders = () => {
    navigate('/orders')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang xử lý kết quả thanh toán...
            </h2>
            <p className="text-gray-600 text-center">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8 text-center">
        {paymentResult?.success ? (
          <>
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentResult.message}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">{paymentResult.orderCode}</span>
                </div>
                {paymentResult.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(paymentResult.amount)}₫
                    </span>
                  </div>
                )}
                {paymentResult.transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-medium">{paymentResult.transactionNo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleContinueShopping}
                size="lg"
                variant="outline"
                className="flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
              <Button
                onClick={handleViewOrders}
                size="lg"
                className="flex items-center justify-center"
              >
                <Package className="w-4 h-4 mr-2" />
                Xem đơn hàng
              </Button>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentResult?.message || 'Có lỗi xảy ra trong quá trình thanh toán'}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-red-800">
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleContinueShopping}
                size="lg"
                variant="outline"
                className="flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
              <Button
                onClick={() => navigate('/checkout')}
                size="lg"
                className="flex items-center justify-center"
              >
                Thử lại thanh toán
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

