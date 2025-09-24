import React from 'react'

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Về Emo Nông Sản</h1>
      <p className="text-gray-600 leading-7 mb-4">
        Emo Nông Sản là nền tảng bán nông sản địa phương, kết nối người nông dân và người tiêu dùng bằng
        các sản phẩm tươi ngon, an toàn. Chúng tôi ưu tiên quy trình minh bạch, kiểm soát chất lượng và trải nghiệm mua sắm thuận tiện.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-lg border bg-white">
          <h3 className="font-semibold text-gray-900 mb-2">Sản phẩm tươi</h3>
          <p className="text-gray-600 text-sm">Thu hoạch mỗi ngày, bảo quản và vận chuyển tiêu chuẩn.</p>
        </div>
        <div className="p-6 rounded-lg border bg-white">
          <h3 className="font-semibold text-gray-900 mb-2">Chuỗi cung ứng minh bạch</h3>
          <p className="text-gray-600 text-sm">Thông tin nguồn gốc, xuất xứ rõ ràng.</p>
        </div>
        <div className="p-6 rounded-lg border bg-white">
          <h3 className="font-semibold text-gray-900 mb-2">Thanh toán an toàn</h3>
          <p className="text-gray-600 text-sm">Hỗ trợ VNPAY và COD, bảo mật dữ liệu người dùng.</p>
        </div>
      </div>
    </div>
  )
}


