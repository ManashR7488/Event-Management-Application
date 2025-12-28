import { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaUserShield } from 'react-icons/fa';
import { getAllUsers, activateUser, deactivateUser, updateUserRole, deleteUser } from '../../../api/adminService';
import { toast } from 'react-hot-toast'; // Changed from react-toastify to react-hot-toast for consistency if used elsewhere, but keeping import consistent with valid project deps
import useAuthStore from '../../../store/authStore';

const UsersTab = () => {
  const { user: currentUser } = useAuthStore();
  
  // State management
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    page: 1,
    limit: 10
  });
  
  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debounce timer
  const [searchTimer, setSearchTimer] = useState(null);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [filters.role, filters.isActive, filters.page, filters.limit]);

  // Debounced search
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    
    setSearchTimer(timer);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAllUsers(filters);
    setIsLoading(false);
    
    if (result.success) {
      setUsers(result.data || []);
      setPagination(result.pagination);
    } else {
      setError(result.error || 'Failed to load users');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleActivateUser = async (userId) => {
    const result = await activateUser(userId);
    if (result.success) {
      toast.success('User activated successfully');
      fetchUsers();
    } else {
      toast.error(result.error || 'Failed to activate user');
    }
  };

  const handleOpenDeactivateConfirm = (user) => {
    if (user._id === currentUser._id) {
      toast.error('You cannot deactivate your own account');
      return;
    }
    setSelectedUser(user);
    setShowDeactivateConfirm(true);
  };

  const handleConfirmDeactivate = async () => {
    setIsSubmitting(true);
    const result = await deactivateUser(selectedUser._id);
    setIsSubmitting(false);
    setShowDeactivateConfirm(false);
    
    if (result.success) {
      toast.success('User deactivated successfully');
      fetchUsers();
    } else {
      toast.error(result.error || 'Failed to deactivate user');
    }
  };

  const handleOpenRoleModal = (user) => {
    if (user._id === currentUser._id) {
      toast.error('You cannot change your own role');
      return;
    }
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    
    setIsSubmitting(true);
    const result = await updateUserRole(selectedUser._id, newRole);
    setIsSubmitting(false);
    setShowRoleModal(false);
    
    if (result.success) {
      toast.success('User role updated successfully');
      fetchUsers();
    } else {
      toast.error(result.error || 'Failed to update user role');
    }
  };

  const handleOpenDeleteConfirm = (user) => {
    if (user._id === currentUser._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteUser(selectedUser._id);
    setIsSubmitting(false);
    setShowDeleteConfirm(false);
    
    if (result.success) {
      toast.success('User deleted successfully');
      fetchUsers();
    } else {
      toast.error(result.error || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-300 border border-red-500/30',
      organizer: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      staff: 'bg-green-500/20 text-green-300 border border-green-500/30',
      teamLead: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    };
    return colors[role] || 'bg-slate-700 text-slate-300 border border-slate-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <p className="text-slate-400 mt-1">Manage platform users and permissions</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300 appearance-none"
            >
              <option value="" className="bg-slate-900">All Roles</option>
              <option value="admin" className="bg-slate-900">Admin</option>
              <option value="organizer" className="bg-slate-900">Organizer</option>
              <option value="staff" className="bg-slate-900">Staff</option>
              <option value="teamLead" className="bg-slate-900">Team Lead</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300 appearance-none"
            >
              <option value="" className="bg-slate-900">All Status</option>
              <option value="true" className="bg-slate-900">Active</option>
              <option value="false" className="bg-slate-900">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="ml-4 text-slate-400">Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-red-400 hover:text-red-300 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && users.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">College</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">
                          {user.name}
                          {user._id === currentUser._id && (
                            <span className="ml-2 text-xs text-cyan-400">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{user.college || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1 text-sm ${user.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                        {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <button
                            onClick={() => handleOpenDeactivateConfirm(user)}
                            disabled={user._id === currentUser._id}
                            className="text-red-400 hover:text-red-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                            title="Deactivate"
                          >
                            <FaTimesCircle />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user._id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Activate"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          disabled={user._id === currentUser._id}
                          className="text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                          title="Change Role"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(user)}
                          disabled={user._id === currentUser._id}
                          className="text-red-400 hover:text-red-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white/5 px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-sm text-slate-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && users.length === 0 && (
        <div className="glass-card p-12 text-center rounded-xl border border-white/10">
          <FaUserShield className="text-slate-600 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-slate-400">Try adjusting your filters</p>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Change User Role</h3>
            <p className="text-sm text-slate-400 mb-4">
              Change role for <span className="font-semibold text-cyan-400">{selectedUser?.name}</span>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white mb-4 appearance-none"
              disabled={isSubmitting}
            >
              <option value="teamLead" className="bg-slate-900">Team Lead</option>
              <option value="staff" className="bg-slate-900">Staff</option>
              <option value="organizer" className="bg-slate-900">Organizer</option>
              <option value="admin" className="bg-slate-900">Admin</option>
            </select>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Deactivate User</h3>
            <p className="text-sm text-slate-400 mb-4">
              Are you sure you want to deactivate <span className="font-semibold text-white">{selectedUser?.name}</span>? They will not be able to access the platform.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Delete User</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Are you sure you want to permanently delete <span className="font-semibold text-white">{selectedUser?.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
