import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Phone, MapPin, Edit3, Save, X } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleSave = () => {
    // TODO: Gọi API cập nhật profile
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hồ Sơ Cá Nhân</h1>
        <p className="text-lg text-gray-600">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-500" />
                Thông tin cá nhân
              </h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Họ và tên"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                icon={<User className="w-5 h-5" />}
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                disabled
                icon={<Mail className="w-5 h-5" />}
              />
              
              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                icon={<Phone className="w-5 h-5" />}
              />
            </div>

            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <Button onClick={handleSave} className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center">
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            )}
          </Card>

          {/* Addresses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Địa chỉ giao hàng
              </h2>
              <Button variant="outline">
                Thêm địa chỉ
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Nguyễn Văn A</h3>
                    <p className="text-gray-600">0123 456 789</p>
                    <p className="text-gray-600">
                      123 Đường ABC, Phường XYZ, Quận 1, TP.HCM
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                    <Button variant="outline" size="sm">
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar */}
          <Card className="p-6 text-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {user?.fullName}
            </h3>
            <p className="text-gray-600 mb-4">
              {user?.email}
            </p>
            <Button variant="outline" size="sm">
              Thay đổi ảnh đại diện
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Đổi mật khẩu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Lịch sử đơn hàng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Danh sách yêu thích
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
