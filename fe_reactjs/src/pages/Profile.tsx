import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Phone, MapPin, Edit3, Save, X, Plus, Trash2 } from 'lucide-react'
import { addressesApi } from '@/services/api'

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [addressOpenTick, setAddressOpenTick] = useState(0)
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
              <Button variant="outline" onClick={() => setAddressOpenTick(t => t + 1)} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Thêm địa chỉ
              </Button>
            </div>
            <AddressSection openSignal={addressOpenTick} />
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

function AddressSection({ openSignal = 0 }: { openSignal?: number }) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({
    recipientName: '', phone: '', province: '', district: '', ward: '', addressLine: '', isDefault: false,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await addressesApi.getAddresses()
      setList(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (openSignal > 0) {
      setEditing(null)
      setForm({ recipientName: '', phone: '', province: '', district: '', ward: '', addressLine: '', isDefault: false })
      setShowForm(true)
    }
  }, [openSignal])

  const onSubmit = async () => {
    setLoading(true)
    try {
      if (editing) {
        await addressesApi.updateAddress(editing.id, form)
      } else {
        await addressesApi.createAddress(form)
      }
      setShowForm(false)
      setEditing(null)
      setForm({ recipientName: '', phone: '', province: '', district: '', ward: '', addressLine: '', isDefault: false })
      await load()
    } finally {
      setLoading(false)
    }
  }

  const onEdit = (addr: any) => {
    setEditing(addr)
    setForm({
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      addressLine: addr.addressLine || '',
      isDefault: !!addr.isDefault,
    })
    setShowForm(true)
  }

  const onDelete = async (id: number) => {
    setLoading(true)
    try {
      await addressesApi.deleteAddress(id)
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-gray-500">Đang xử lý...</div>}

      {showForm && (
        <div className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Người nhận" value={form.recipientName} onChange={e=>setForm({...form, recipientName:e.target.value})} />
            <Input label="Số điện thoại" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            <Input label="Tỉnh/TP" value={form.province} onChange={e=>setForm({...form, province:e.target.value})} />
            <Input label="Quận/Huyện" value={form.district} onChange={e=>setForm({...form, district:e.target.value})} />
            <Input label="Phường/Xã" value={form.ward} onChange={e=>setForm({...form, ward:e.target.value})} />
            <Input label="Địa chỉ" value={form.addressLine} onChange={e=>setForm({...form, addressLine:e.target.value})} />
          </div>
          <div className="flex items-center gap-3">
            <input id="isDefault" type="checkbox" checked={form.isDefault} onChange={e=>setForm({...form, isDefault:e.target.checked})} />
            <label htmlFor="isDefault" className="text-sm">Đặt làm địa chỉ mặc định</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={loading}>
              {editing ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
            </Button>
            <Button variant="outline" onClick={()=>{setShowForm(false); setEditing(null)}}>Hủy</Button>
          </div>
        </div>
      )}

      {list.map((addr) => (
        <div key={addr.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {addr.recipientName} {addr.isDefault && <span className="ml-2 text-xs text-white bg-green-600 px-2 py-0.5 rounded">Mặc định</span>}
              </h3>
              <p className="text-gray-600">{addr.phone}</p>
              <p className="text-gray-600">{addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={()=>onEdit(addr)}>
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={()=>onDelete(addr.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Xóa
              </Button>
            </div>
          </div>
        </div>
      ))}

      {!showForm && (
        <Button variant="outline" onClick={()=>setShowForm(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ
        </Button>
      )}
    </div>
  )
}
