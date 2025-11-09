import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Save, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'

interface Settings {
  site_name?: string
  site_description?: string
  contact_email?: string
  contact_phone?: string
  contact_address?: string
  currency?: string
  shipping_fee?: string
}

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<Settings>({})
  const [isSaving, setIsSaving] = useState(false)

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery(
    ['admin-settings'],
    () => adminApi.getSettings().then(res => res.data),
    {
      onSuccess: (data) => {
        setSettings(data || {})
      }
    }
  )

  // Update setting mutation
  const updateSettingMutation = useMutation(
    ({ key, value }: { key: string; value: string }) => 
      adminApi.updateSetting(key, value),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-settings'])
        toast.success('Đã cập nhật cài đặt')
      },
      onError: () => {
        toast.error('Lỗi khi cập nhật cài đặt')
      }
    }
  )

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (key: string) => {
    const value = settings[key as keyof Settings] || ''
    setIsSaving(true)
    try {
      await updateSettingMutation.mutateAsync({ key, value })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        adminApi.updateSetting(key, value || '')
      )
      await Promise.all(promises)
      queryClient.invalidateQueries(['admin-settings'])
      toast.success('Đã lưu tất cả cài đặt')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cài đặt chung của website</p>
        </div>

        <div className="space-y-6">
          {/* Thông tin website */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin Website</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên website
                </label>
                <Input
                  value={settings.site_name || ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  placeholder="Emo Nông Sản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả website
                </label>
                <textarea
                  value={settings.site_description || ''}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  placeholder="Website bán nông sản địa phương tươi ngon"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Thông tin liên hệ */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin Liên hệ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email liên hệ
                </label>
                <Input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="info@emonongsan.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <Input
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="0123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  value={settings.contact_address || ''}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Cài đặt thanh toán & vận chuyển */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thanh toán & Vận chuyển</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị tiền tệ
                </label>
                <select
                  value={settings.currency || 'VND'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí vận chuyển (VND)
                </label>
                <Input
                  type="number"
                  value={settings.shipping_fee || ''}
                  onChange={(e) => handleChange('shipping_fee', e.target.value)}
                  placeholder="20000"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Lưu tất cả cài đặt</span>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

