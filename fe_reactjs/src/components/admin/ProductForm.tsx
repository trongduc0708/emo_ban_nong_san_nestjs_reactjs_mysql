import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Plus, 
  Trash2, 
  Upload,
  Package,
  DollarSign,
  Hash,
  FileText
} from 'lucide-react'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

interface Variant {
  variantName: string
  unitLabel: string
  price: number
  compareAtPrice?: number
  stockQuantity: number
  isActive: boolean
}

interface Image {
  imageUrl: string
  position: number
  file?: File
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    origin: '',
    categoryId: '',
    isActive: true
  })
  
  const [variants, setVariants] = useState<Variant[]>([
    {
      variantName: 'Mặc định',
      unitLabel: 'cái',
      price: 0,
      compareAtPrice: 0,
      stockQuantity: 0,
      isActive: true
    }
  ])
  
  const [images, setImages] = useState<Image[]>([
    { imageUrl: '', position: 1 }
  ])

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        origin: product.origin || '',
        categoryId: product.categoryId?.toString() || '',
        isActive: product.isActive ?? true
      })
      
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map((v: any) => ({
          variantName: v.variantName || '',
          unitLabel: v.unitLabel || '',
          price: v.price || 0,
          compareAtPrice: v.compareAtPrice || 0,
          stockQuantity: v.stockQuantity || 0,
          isActive: v.isActive ?? true
        })))
      }
      
      if (product.images && product.images.length > 0) {
        setImages(product.images.map((img: any, index: number) => ({
          imageUrl: img.imageUrl || '',
          position: index + 1
        })))
      }
    }
  }, [product])

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to mock data
      setCategories([
        { id: 1, name: 'Rau Củ' },
        { id: 2, name: 'Trái Cây' },
        { id: 3, name: 'Đặc Sản' },
        { id: 4, name: 'Hữu Cơ' },
        { id: 5, name: 'Gia Vị' }
      ])
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    }
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, {
      variantName: '',
      unitLabel: 'cái',
      price: 0,
      compareAtPrice: 0,
      stockQuantity: 0,
      isActive: true
    }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = {
      ...newImages[index],
      imageUrl: value
    }
    setImages(newImages)
  }

  const handleFileChange = (index: number, file: File) => {
    const newImages = [...images]
    newImages[index] = {
      ...newImages[index],
      file: file,
      imageUrl: URL.createObjectURL(file) // Preview
    }
    setImages(newImages)
  }

  const addImage = () => {
    setImages([...images, {
      imageUrl: '',
      position: images.length + 1
    }])
  }

  const removeImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.categoryId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (variants.some(v => !v.variantName || v.price <= 0)) {
      toast.error('Vui lòng kiểm tra lại thông tin variants')
      return
    }

    setLoading(true)
    
    try {
      // Upload images first if there are files
      const uploadedImages = []
      for (const image of images) {
        if (image.file) {
          try {
            const uploadResponse = await adminApi.uploadProductImage(image.file, product?.id?.toString())
            uploadedImages.push({
              imageUrl: uploadResponse.data.data.url,
              position: image.position
            })
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError)
            toast.error('Lỗi khi upload hình ảnh')
            return
          }
        } else if (image.imageUrl) {
          uploadedImages.push({
            imageUrl: image.imageUrl,
            position: image.position
          })
        }
      }

      const data = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        variants: variants.filter(v => v.variantName && v.price > 0),
        images: uploadedImages
      }

      if (product) {
        await adminApi.updateProduct(product.id, data)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        await adminApi.createProduct(data)
        toast.success('Tạo sản phẩm thành công')
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu sản phẩm')
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mã sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xuất xứ
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nơi sản xuất"
                />
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
                placeholder="Mô tả sản phẩm"
              />
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h3>
                <Button type="button" onClick={addVariant} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm biến thể
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Biến thể {index + 1}</h4>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên biến thể *
                        </label>
                        <input
                          type="text"
                          value={variant.variantName}
                          onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="VD: Túi 1kg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Đơn vị
                        </label>
                        <input
                          type="text"
                          value={variant.unitLabel}
                          onChange={(e) => handleVariantChange(index, 'unitLabel', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="VD: túi, kg, cái"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá bán (₫) *
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá so sánh (₫)
                        </label>
                        <input
                          type="number"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) => handleVariantChange(index, 'compareAtPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng tồn kho
                        </label>
                        <input
                          type="number"
                          value={variant.stockQuantity}
                          onChange={(e) => handleVariantChange(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Đang bán</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hình ảnh */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
                <Button type="button" onClick={addImage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm hình ảnh
                </Button>
              </div>

              <div className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Hình ảnh {index + 1}</h4>
                      {images.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hình ảnh sản phẩm
                      </label>
                      
                      {/* File Upload */}
                      <div className="mb-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileChange(index, file)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Chọn file ảnh (JPG, PNG, GIF) - Tối đa 5MB
                        </p>
                      </div>

                      {/* URL Input (Alternative) */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hoặc nhập URL hình ảnh
                        </label>
                        <input
                          type="url"
                          value={image.imageUrl}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      {/* Image Preview */}
                      {image.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={image.imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sản phẩm đang bán</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Tạo sản phẩm')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
