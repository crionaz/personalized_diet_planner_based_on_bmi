import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { fetchUsers, deleteUser, updateUser } from '../../store/slices/userSlice'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, isLoading, pagination } = useSelector((state: RootState) => state.users)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(fetchUsers({ 
      page: 1, 
      limit: 10, 
      search: searchTerm || undefined 
    }))
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap()
        toast.success('User deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user')
      }
    }
  }

  const handleToggleUserStatus = async (user: any) => {
    try {
      await dispatch(updateUser({
        id: user._id,
        data: { isActive: !user.isActive }
      })).unwrap()
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status')
    }
  }

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      await dispatch(updateUser({
        id: user._id,
        data: { role: newRole }
      })).unwrap()
      toast.success('User role updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="btn-admin-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isActive)}`}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="text-sm text-gray-900 dark:text-white">
                      {user.lastLogin 
                        ? format(new Date(user.lastLogin), 'MMM dd, yyyy')
                        : 'Never'
                      }
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => dispatch(fetchUsers({ page: pagination.page - 1, limit: pagination.limit }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(fetchUsers({ page: pagination.page + 1, limit: pagination.limit }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
