import React from 'react'
import { Leaf, Truck, Shield, Heart, Users, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Về Emo Nông Sản
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Kết nối người tiêu dùng với nông sản tươi ngon, chất lượng cao từ các trang trại địa phương
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết mang đến cho khách hàng những sản phẩm nông sản tươi ngon nhất, 
              đồng thời hỗ trợ các nông dân địa phương phát triển bền vững.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sản phẩm tươi ngon</h3>
              <p className="text-gray-600">
                Chọn lọc kỹ càng từ các trang trại uy tín, đảm bảo chất lượng và độ tươi ngon
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-600">
                Hệ thống logistics hiện đại, giao hàng tận nơi trong thời gian ngắn nhất
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">An toàn thực phẩm</h3>
              <p className="text-gray-600">
                Tuân thủ nghiêm ngặt các tiêu chuẩn vệ sinh an toàn thực phẩm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Giá trị cốt lõi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tận tâm</h3>
              <p className="text-gray-600 text-sm">
                Luôn đặt lợi ích khách hàng lên hàng đầu
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cộng đồng</h3>
              <p className="text-gray-600 text-sm">
                Xây dựng cộng đồng nông nghiệp bền vững
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chất lượng</h3>
              <p className="text-gray-600 text-sm">
                Cam kết mang đến sản phẩm chất lượng cao nhất
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bền vững</h3>
              <p className="text-gray-600 text-sm">
                Phát triển nông nghiệp thân thiện với môi trường
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Câu chuyện của chúng tôi
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Emo Nông Sản được thành lập với mong muốn kết nối người tiêu dùng với 
                  những sản phẩm nông sản tươi ngon từ các trang trại địa phương. 
                  Chúng tôi tin rằng mỗi bữa ăn đều nên được làm từ những nguyên liệu 
                  tươi ngon và an toàn nhất.
                </p>
                <p>
                  Từ những ngày đầu khởi nghiệp với một nhóm nhỏ, chúng tôi đã không ngừng 
                  nỗ lực để xây dựng một hệ sinh thái nông nghiệp bền vững, nơi người nông dân 
                  có thể bán sản phẩm với giá trị công bằng và người tiêu dùng có thể tiếp cận 
                  những sản phẩm chất lượng cao.
                </p>
                <p>
                  Hôm nay, chúng tôi tự hào là cầu nối tin cậy giữa hàng nghìn nông dân 
                  và hàng chục nghìn khách hàng trên khắp cả nước.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-4xl">E</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Emo Nông Sản</h3>
                <p className="text-gray-600">
                  Nơi hội tụ tinh hoa nông sản Việt Nam
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600">info@emonongsan.com</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Điện thoại</h3>
                <p className="text-gray-600">0123 456 789</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📍</span>
        </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Địa chỉ</h3>
                <p className="text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM</p>
        </div>
        </div>
      </div>
      </div>
      </section>
    </div>
  )
}
