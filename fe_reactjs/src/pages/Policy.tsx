import React from 'react'
import { Shield, RotateCcw, Clock, CheckCircle, AlertCircle, Phone } from 'lucide-react'

export default function Policy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chính sách đổi trả & bảo hành
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Cam kết mang đến trải nghiệm mua sắm tốt nhất với chính sách đổi trả linh hoạt và bảo hành toàn diện
            </p>
          </div>
        </div>
      </section>

      {/* Policy Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tổng quan chính sách
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết đảm bảo quyền lợi tối đa cho khách hàng với các chính sách 
              đổi trả và bảo hành minh bạch, công bằng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đổi trả 7 ngày</h3>
              <p className="text-gray-600">
                Đổi trả miễn phí trong vòng 7 ngày kể từ ngày nhận hàng
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Bảo hành chất lượng</h3>
              <p className="text-gray-600">
                Đảm bảo chất lượng sản phẩm 100% tươi ngon khi giao hàng
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">
                Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ mọi lúc
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Policy */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Chính sách đổi trả
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Điều kiện đổi trả</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Thời gian đổi trả</p>
                    <p className="text-gray-600">Trong vòng 7 ngày kể từ ngày nhận hàng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Tình trạng sản phẩm</p>
                    <p className="text-gray-600">Sản phẩm còn nguyên vẹn, chưa sử dụng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Hóa đơn gốc</p>
                    <p className="text-gray-600">Cần có hóa đơn mua hàng hoặc mã đơn hàng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Lý do đổi trả</p>
                    <p className="text-gray-600">Không hài lòng về chất lượng hoặc không đúng mô tả</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Quy trình đổi trả</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-gray-800">Liên hệ hỗ trợ</p>
                    <p className="text-gray-600">Gọi hotline hoặc gửi email yêu cầu đổi trả</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-gray-800">Xác nhận thông tin</p>
                    <p className="text-gray-600">Chúng tôi sẽ xác nhận thông tin đơn hàng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-gray-800">Thu hồi sản phẩm</p>
                    <p className="text-gray-600">Nhân viên sẽ đến thu hồi sản phẩm</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium text-gray-800">Hoàn tiền</p>
                    <p className="text-gray-600">Hoàn tiền 100% trong vòng 3-5 ngày làm việc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Policy */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Chính sách bảo hành
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Cam kết chất lượng</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Sản phẩm tươi ngon</p>
                    <p className="text-gray-600">Đảm bảo 100% sản phẩm tươi ngon khi giao hàng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">An toàn thực phẩm</p>
                    <p className="text-gray-600">Tuân thủ nghiêm ngặt các tiêu chuẩn vệ sinh</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Đúng mô tả</p>
                    <p className="text-gray-600">Sản phẩm đúng như mô tả trên website</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Đóng gói cẩn thận</p>
                    <p className="text-gray-600">Đóng gói đảm bảo sản phẩm không bị hư hỏng</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Bảo hành đặc biệt</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Sản phẩm hư hỏng trong quá trình vận chuyển</p>
                      <p className="text-gray-600">Đổi mới 100% miễn phí</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Sản phẩm không đúng mô tả</p>
                      <p className="text-gray-600">Hoàn tiền 100% hoặc đổi sản phẩm khác</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Giao hàng trễ hơn cam kết</p>
                      <p className="text-gray-600">Giảm giá 10% cho đơn hàng tiếp theo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cần hỗ trợ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hotline</h3>
                <p className="text-gray-600 mb-2">0123 456 789</p>
                <p className="text-sm text-gray-500">24/7 hỗ trợ</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600 mb-2">support@emonongsan.com</p>
                <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat trực tuyến</h3>
                <p className="text-gray-600 mb-2">Live chat</p>
                <p className="text-sm text-gray-500">8:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tôi có thể đổi trả sản phẩm sau bao lâu?
              </h3>
              <p className="text-gray-600">
                Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng. 
                Sản phẩm phải còn nguyên vẹn và chưa sử dụng.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Chi phí đổi trả có mất phí không?
              </h3>
              <p className="text-gray-600">
                Chúng tôi miễn phí đổi trả cho tất cả khách hàng. Chi phí vận chuyển 
                thu hồi sản phẩm sẽ do chúng tôi chịu.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Thời gian hoàn tiền là bao lâu?
              </h3>
              <p className="text-gray-600">
                Sau khi xác nhận đổi trả, chúng tôi sẽ hoàn tiền trong vòng 3-5 ngày làm việc 
                qua phương thức thanh toán ban đầu của bạn.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sản phẩm bị hư hỏng trong quá trình vận chuyển thì sao?
              </h3>
              <p className="text-gray-600">
                Nếu sản phẩm bị hư hỏng do lỗi vận chuyển, chúng tôi sẽ đổi mới 100% 
                miễn phí hoặc hoàn tiền toàn bộ giá trị đơn hàng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
