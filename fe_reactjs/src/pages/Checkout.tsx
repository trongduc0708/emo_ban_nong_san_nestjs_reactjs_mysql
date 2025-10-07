import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
// import { Textarea } from '@/components/ui/Textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Label } from '@/components/ui/Label'
import { Check, MapPin, Plus, Trash2, Edit } from 'lucide-react'
import { formatPrice, calculateTotalPrice } from '@/utils/priceUtils'
import { addressesApi, paymentApi } from '@/services/api'
import toast from 'react-hot-toast'

interface Address {
  id: number
  recipientName: string
  phone: string
  province: string
  district: string
  ward: string
  addressLine: string
  isDefault: boolean
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  
  // Form data for new/edit address
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    addressLine: '',
    isDefault: false
  })

  const shippingFee = 20000
  const totalAmount = totalPrice + shippingFee

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    
    loadAddresses()
  }, [user, items, navigate])

  const loadAddresses = async () => {
    try {
      const response = await addressesApi.getAddresses()
      setAddresses(response.data.data || [])
      
      // Auto-select default address
      const defaultAddress = response.data.data?.find((addr: Address) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      } else if (response.data.data?.length > 0) {
        setSelectedAddressId(response.data.data[0].id)
      }
    } catch (error) {
      console.error('Lỗi tải địa chỉ:', error)
      toast.error('Không thể tải danh sách địa chỉ')
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (editingAddress) {
        await addressesApi.updateAddress(editingAddress.id, addressForm)
        toast.success('Cập nhật địa chỉ thành công')
      } else {
        await addressesApi.createAddress(addressForm)
        toast.success('Thêm địa chỉ thành công')
      }
      
      await loadAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        recipientName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        addressLine: '',
        isDefault: false
      })
    } catch (error: any) {
      console.error('Lỗi lưu địa chỉ:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      addressLine: address.addressLine,
      isDefault: address.isDefault
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return
    
    try {
      await addressesApi.deleteAddress(addressId)
      toast.success('Xóa địa chỉ thành công')
      await loadAddresses()
    } catch (error: any) {
      console.error('Lỗi xóa địa chỉ:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa địa chỉ')
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }

    try {
      setLoading(true)
      
      // Get cart ID (assuming we have one cart per user)
      const cartResponse = await paymentApi.getCart()
      const cartId = cartResponse.data.data?.id
      
      if (!cartId) {
        throw new Error('Không tìm thấy giỏ hàng')
      }

      const response = await paymentApi.processPayment({
        cartId,
        paymentMethod,
        notes
      })

      if (response.data.success) {
        toast.success('Đặt hàng thành công!')
        clearCart()
        navigate(`/order-success/${response.data.data.orderId}`)
      }
    } catch (error: any) {
      console.error('Lỗi đặt hàng:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <Button onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Địa chỉ giao hàng
            </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingAddress(null)
                  setAddressForm({
                    recipientName: '',
                    phone: '',
                    province: '',
                    district: '',
                    ward: '',
                    addressLine: '',
                    isDefault: false
                  })
                  setShowAddressForm(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm địa chỉ
              </Button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-900">
                            {address.recipientName}
                          </span>
                          {address.isDefault && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.phone}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {address.addressLine}, {address.ward}, {address.district}, {address.province}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedAddressId === address.id && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAddress(address)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAddress(address.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có địa chỉ nào. Vui lòng thêm địa chỉ giao hàng.
              </p>
            )}
          </Card>

          {/* Address Form Modal */}
          {showAddressForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h3>
              
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">Tên người nhận *</Label>
              <Input
                      id="recipientName"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="province">Tỉnh/Thành phố *</Label>
              <Input
                      id="province"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">Quận/Huyện *</Label>
              <Input
                      id="district"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward">Phường/Xã *</Label>
              <Input
                      id="ward"
                      value={addressForm.ward}
                      onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                      required
                    />
                  </div>
            </div>
            
                <div>
                  <Label htmlFor="addressLine">Địa chỉ chi tiết *</Label>
              <Input
                    id="addressLine"
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    required
              />
            </div>
            
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddressForm(false)
                      setEditingAddress(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                  </Button>
            </div>
              </form>
          </Card>
          )}

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Phương thức thanh toán
            </h2>
            
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'COD' | 'VNPAY')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VNPAY" id="vnpay" />
                <Label htmlFor="vnpay">Thanh toán online (VNPAY)</Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ghi chú đơn hàng
            </h2>
            
            <textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h3>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} {item.variant?.variantName && `(${item.variant.variantName})`} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unitPriceSnapshot * item.quantity)}₫
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {formatPrice(totalPrice)}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {formatPrice(shippingFee)}₫
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatPrice(totalAmount)}₫
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!selectedAddressId || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}