import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function OrderFailed() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-gray-600">
            Rất tiếc, quá trình thanh toán của bạn đã bị gián đoạn hoặc thất bại.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            Vui lòng kiểm tra lại thông tin thanh toán và thử lại.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/checkout">
              <Button size="lg" className="w-full sm:w-auto">
                Thử lại thanh toán
              </Button>
            </Link>
            
            <Link to="/cart">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại giỏ hàng
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            Cần hỗ trợ?
          </h3>
          <p className="text-sm text-gray-600">
            Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ với chúng tôi:
          </p>
          <div className="mt-2 text-sm text-gray-700">
            <p>📧 Email: info@emonongsan.com</p>
            <p>📞 Hotline: 0123 456 789</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
