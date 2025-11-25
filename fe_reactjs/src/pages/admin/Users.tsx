import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Search, 
  Filter,
  Eye,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  Loader2
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface User {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: 'customer' | 'admin' | 'seller'
  avatarUrl: string | null
  createdAt: string
  ordersCount: number
  totalSpent: number
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingRole, setPendingRole] = useState<'customer' | 'admin' | 'seller' | null>(null)
  const queryClient = useQueryClient()
  const limit = 10

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', currentPage, searchTerm, filterRole],
    () => adminApi.getUsers({
      page: currentPage,
      limit,
      search: searchTerm || undefined,
      role: filterRole === 'all' ? undefined : filterRole
    }).then(res => res.data),
    { keepPreviousData: true }
  )

  const users = usersData?.data?.users || usersData?.users || []
  const pagination = usersData?.data?.pagination || usersData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }

  // Update user role mutation
  const updateRoleMutation = useMutation(
    ({ id, role }: { id: number; role: 'customer' | 'admin' | 'seller' }) => 
      adminApi.updateUserRole(id, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users'])
        toast.success('Đã cập nhật vai trò thành công')
        setShowRoleModal(false)
        setSelectedUser(null)
      },
      onError: () => {
        toast.error('Lỗi khi cập nhật vai trò')
      }
    }
  )

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setShowRoleModal(true)
  }

  const handleConfirmRoleChange = (newRole: 'customer' | 'admin' | 'seller') => {
    if (!selectedUser) return
    setPendingRole(newRole)
    setShowConfirmDialog(true)
  }

  const confirmRoleChange = () => {
    if (!selectedUser || !pendingRole) return
    updateRoleMutation.mutate({ id: parseInt(selectedUser.id), role: pendingRole })
    setShowConfirmDialog(false)
    setPendingRole(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-100'
      case 'customer':
        return 'text-blue-600 bg-blue-100'
      case 'seller':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'customer':
        return 'Khách hàng'
      case 'seller':
        return 'Người bán'
      default:
        return role
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const stats = {
    total: pagination.total,
    customers: users.filter((u: User) => u.role === 'customer').length,
    admins: users.filter((u: User) => u.role === 'admin').length,
    sellers: users.filter((u: User) => u.role === 'seller').length,
    totalRevenue: users.reduce((sum: number, u: User) => sum + u.totalSpent, 0)
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
              <p className="text-lg text-gray-600">
                Quản lý thông tin người dùng và phân quyền
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người bán</p>
                <p className="text-2xl font-bold text-green-600">{stats.sellers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
                <option value="seller">Người bán</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
          ) : (
            <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Người dùng
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Liên hệ
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vai trò
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đơn hàng
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tổng chi tiêu
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          Không có người dùng nào
                        </td>
                      </tr>
                    ) : (
                      users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName}
                                  className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                              ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                              )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email}
                        </div>
                              {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.phone}
                        </div>
                              )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.ordersCount} đơn
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(user.totalSpent)}
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeRole(user)}
                              disabled={updateRoleMutation.isLoading}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Đổi vai trò
                        </Button>
                    </td>
                  </tr>
                      ))
                    )}
              </tbody>
            </table>
          </div>

        {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                    {pagination.total} người dùng
            </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.page === 1}
                    >
                Trước
              </Button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={pagination.page === pagination.pages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowRoleModal(false)} />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi vai trò</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Người dùng: <span className="font-medium">{selectedUser.fullName}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Vai trò hiện tại: <span className="font-medium">{getRoleText(selectedUser.role)}</span>
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant={selectedUser.role === 'admin' ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleConfirmRoleChange('admin')}
                        disabled={updateRoleMutation.isLoading || selectedUser.role === 'admin'}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Quản trị viên
                      </Button>
                      <Button
                        variant={selectedUser.role === 'customer' ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleConfirmRoleChange('customer')}
                        disabled={updateRoleMutation.isLoading || selectedUser.role === 'customer'}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Khách hàng
                      </Button>
                      <Button
                        variant={selectedUser.role === 'seller' ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleConfirmRoleChange('seller')}
                        disabled={updateRoleMutation.isLoading || selectedUser.role === 'seller'}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Người bán
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleModal(false)
                      setSelectedUser(null)
                    }}
                    className="w-full sm:w-auto"
                  >
                    Đóng
                </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận đổi vai trò"
          message={selectedUser && pendingRole 
            ? `Bạn có chắc muốn đổi vai trò của ${selectedUser.fullName} thành ${pendingRole === 'admin' ? 'Quản trị viên' : pendingRole === 'seller' ? 'Người bán' : 'Khách hàng'}?`
            : 'Bạn có chắc muốn đổi vai trò này?'}
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={confirmRoleChange}
          onCancel={() => {
            setShowConfirmDialog(false)
            setPendingRole(null)
          }}
          variant="warning"
        />
      </div>
    </AdminLayout>
  )
}
