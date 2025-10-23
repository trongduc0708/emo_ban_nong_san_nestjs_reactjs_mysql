import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Folder,
  FileText,
  Hash,
  ArrowUp
} from 'lucide-react'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'

interface CategoryFormProps {
  category?: any
  categories: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function CategoryForm({ category, categories, onClose, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    position: 0,
    parentId: ''
  })

  // Load category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive ?? true,
        position: category.position || 0,
        parentId: category.parentId || ''
      })
    }
  }, [category])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    setLoading(true)
    
    try {
      const data = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        position: parseInt(formData.position.toString()) || 0
      }

      if (category) {
        await adminApi.updateCategory(parseInt(category.id), data)
        toast.success('Cập nhật danh mục thành công')
      } else {
        await adminApi.createCategory(data)
        toast.success('Tạo danh mục thành công')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục')
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get parent categories (exclude current category and its children)
  const getParentOptions = () => {
    if (!category) return categories.filter(c => !c.parentId)
    
    // Exclude current category and its children
    const excludeIds = [category.id]
    const getChildrenIds = (parentId: string) => {
      const children = categories.filter(c => c.parentId === parentId)
      children.forEach(child => {
        excludeIds.push(child.id)
        getChildrenIds(child.id)
      })
    }
    getChildrenIds(category.id)
    
    return categories.filter(c => !c.parentId && !excludeIds.includes(c.id))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <Button variant="outline" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục cha
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục cha (tùy chọn)</option>
                  {getParentOptions().map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí hiển thị
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số càng nhỏ, hiển thị càng trước
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Danh mục đang hoạt động</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mô tả danh mục"
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Xem trước</h3>
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{formData.name || 'Tên danh mục'}</div>
                  <div className="text-sm text-gray-500">
                    {formData.description || 'Mô tả danh mục'}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Slug: {formData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()}
                    </span>
                    <span className="text-xs text-gray-500">Vị trí: {formData.position}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      formData.isActive 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {formData.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Tạo danh mục')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
