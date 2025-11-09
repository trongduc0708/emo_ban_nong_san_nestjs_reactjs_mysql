import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Folder,
  FolderOpen,
  Hash,
  FileText,
  TrendingUp
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import CategoryForm from '../../components/admin/CategoryForm'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  position: number
  parentId?: string
  parent?: {
    id: string
    name: string
  }
  children?: Category[]
  _count?: {
    products: number
  }
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  /**
   * Tải danh sách danh mục từ API với phân trang client-side
   * Hỗ trợ tìm kiếm và lọc theo trạng thái
   */
  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getCategories()
      const allCategories = response.data
      
      // Calculate pagination
      const total = allCategories.length
      const pages = Math.ceil(total / pagination.limit)
      const startIndex = (pagination.page - 1) * pagination.limit
      const endIndex = startIndex + pagination.limit
      const paginatedCategories = allCategories.slice(startIndex, endIndex)
      
      setCategories(paginatedCategories)
      setPagination(prev => ({
        ...prev,
        total,
        pages
      }))
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục')
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [pagination.page])

  /**
   * Xóa danh mục với xác nhận từ người dùng
   * Kiểm tra ràng buộc: không xóa danh mục có sản phẩm hoặc danh mục con
   * @param id - ID của danh mục cần xóa
   */
  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id)
    setShowConfirmDialog(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await adminApi.deleteCategory(parseInt(categoryToDelete))
      toast.success('Xóa danh mục thành công')
      loadCategories()
      setShowConfirmDialog(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa danh mục')
      console.error('Error deleting category:', error)
      setShowConfirmDialog(false)
      setCategoryToDelete(null)
    }
  }

  /**
   * Mở form thêm danh mục mới
   */
  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  /**
   * Mở form chỉnh sửa danh mục
   * @param category - Danh mục cần chỉnh sửa
   */
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  /**
   * Đóng form danh mục và reset state
   */
  const handleFormClose = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  /**
   * Xử lý khi form lưu thành công - reload danh sách danh mục
   */
  const handleFormSuccess = () => {
    loadCategories()
  }

  /**
   * Lấy màu sắc cho trạng thái danh mục
   * @param isActive - Trạng thái hoạt động của danh mục
   * @returns CSS classes cho màu sắc
   */
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100'
  }

  /**
   * Lấy text hiển thị cho trạng thái danh mục
   * @param isActive - Trạng thái hoạt động của danh mục
   * @returns Text hiển thị
   */
  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Tạm dừng'
  }

  /**
   * Lọc danh mục theo từ khóa tìm kiếm và trạng thái
   * Hỗ trợ tìm kiếm theo tên danh mục
   */
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive)
    return matchesSearch && matchesStatus
  })

  // Group categories by parent/child relationship
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    if (!category.parentId) {
      acc.push({
        ...category,
        children: filteredCategories.filter(child => child.parentId === category.id)
      })
    }
    return acc
  }, [] as Category[])

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
            <p className="text-gray-600 mt-2">Quản lý danh mục sản phẩm và cấu trúc phân cấp</p>
          </div>
          <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            <span>Thêm danh mục</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục gốc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => !c.parentId).length}
                </p>
              </div>
              <FolderOpen className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục con</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.parentId).length}
                </p>
              </div>
              <Hash className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Categories List */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải danh mục...</p>
            </div>
          ) : groupedCategories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục</h3>
              <p className="text-gray-600 mb-4">Bắt đầu bằng cách tạo danh mục đầu tiên</p>
              <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  {/* Parent Category */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.description || 'Không có mô tả'}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">Slug: {category.slug}</span>
                            <span className="text-xs text-gray-500">Vị trí: {category.position}</span>
                            {category._count && (
                              <span className="text-xs text-gray-500">
                                {category._count.products} sản phẩm
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(category.isActive)}`}>
                        {getStatusText(category.isActive)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Child Categories */}
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 ml-6 space-y-2">
                      {category.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-800">{child.name}</h4>
                              <p className="text-sm text-gray-500">{child.description || 'Không có mô tả'}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">Slug: {child.slug}</span>
                                <span className="text-xs text-gray-500">Vị trí: {child.position}</span>
                                {child._count && (
                                  <span className="text-xs text-gray-500">
                                    {child._count.products} sản phẩm
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(child.isActive)}`}>
                              {getStatusText(child.isActive)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCategory(child)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCategory(child.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} danh mục
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Trước
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận xóa danh mục"
          message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDeleteCategory}
          onCancel={() => {
            setShowConfirmDialog(false)
            setCategoryToDelete(null)
          }}
          variant="danger"
        />
      </div>
    </AdminLayout>
  )
}
