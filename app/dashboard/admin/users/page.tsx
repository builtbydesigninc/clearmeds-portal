'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Search, Mail, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export default function AdminUsersPage() {
  const { isCollapsed } = useSidebarCollapse()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      fetchUsers()
    }
    checkAuth()
  }, [page, searchQuery, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminUsers({
        page,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter || undefined
      })
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: number) => {
    try {
      await api.approveUser(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.message || 'Failed to approve user')
    }
  }

  const handleReject = async (userId: number) => {
    if (!confirm('Are you sure you want to reject this user?')) {
      return
    }
    try {
      await api.rejectUser(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.message || 'Failed to reject user')
    }
  }

  const handleViewUser = async (userId: number) => {
    setSelectedUser(userId)
    setViewDialogOpen(true)
    setLoadingDetails(true)
    try {
      const details = await api.getAdminUserById(userId)
      setUserDetails(details)
    } catch (err: any) {
      alert(err.message || 'Failed to load user details')
      setViewDialogOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-600 hover:bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-50 text-red-600 hover:bg-red-50"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc2626] mx-auto mb-4"></div>
          <p className="text-[#6c727f]">Checking authorization...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access Denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#131313] mb-2">User Management</h1>
            <p className="text-[#6c727f]">View and manage all affiliates</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c727f]" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 bg-[#f8f8f8] border-[#e6e6e6]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('')}
                  className={statusFilter === '' ? 'bg-[#2861a9] text-white' : ''}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  className={statusFilter === 'pending' ? 'bg-[#2861a9] text-white' : ''}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  className={statusFilter === 'active' ? 'bg-[#2861a9] text-white' : ''}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  className={statusFilter === 'rejected' ? 'bg-[#2861a9] text-white' : ''}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-[#e6e6e6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f8f8] border-b border-[#e6e6e6]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Affiliate ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Registered</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[#6c727f]">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-red-600">{error}</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[#6c727f]">No users found</td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.ID} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                        <td className="p-4 text-[#131313]">#{user.ID}</td>
                        <td className="p-4 text-[#131313] font-medium">{user.display_name}</td>
                        <td className="p-4 text-[#6c727f]">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {user.user_email}
                          </div>
                        </td>
                        <td className="p-4 text-[#131313]">{user.affiliate_id || 'N/A'}</td>
                        <td className="p-4">{getStatusBadge(user.affiliate_status || 'pending')}</td>
                        <td className="p-4 text-[#6c727f] text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.user_registered).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user.ID)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {user.affiliate_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-[#3ba321] hover:bg-[#2d7a1a] text-white"
                                  onClick={() => handleApprove(user.ID)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(user.ID)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Review all user information before approving
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]"></div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#131313] mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">User ID</p>
                    <p className="text-sm text-[#131313]">#{userDetails.ID}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Affiliate ID</p>
                    <p className="text-sm text-[#131313]">{userDetails.affiliate_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Name</p>
                    <p className="text-sm text-[#131313]">{userDetails.first_name} {userDetails.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Display Name</p>
                    <p className="text-sm text-[#131313]">{userDetails.display_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Email</p>
                    <p className="text-sm text-[#131313]">{userDetails.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Status</p>
                    {getStatusBadge(userDetails.affiliate_status)}
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Registered</p>
                    <p className="text-sm text-[#131313]">{new Date(userDetails.user_registered).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(userDetails.phone || userDetails.address) && (
                <div>
                  <h3 className="text-sm font-semibold text-[#131313] mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {userDetails.phone && (
                      <div>
                        <p className="text-xs text-[#6c727f] mb-1">Phone</p>
                        <p className="text-sm text-[#131313]">{userDetails.phone}</p>
                      </div>
                    )}
                    {userDetails.address && (
                      <div className="col-span-2">
                        <p className="text-xs text-[#6c727f] mb-1">Address</p>
                        <p className="text-sm text-[#131313]">
                          {userDetails.address}
                          {userDetails.city && `, ${userDetails.city}`}
                          {userDetails.state && `, ${userDetails.state}`}
                          {userDetails.zip_code && ` ${userDetails.zip_code}`}
                        </p>
                      </div>
                    )}
                    {userDetails.company && (
                      <div>
                        <p className="text-xs text-[#6c727f] mb-1">Company</p>
                        <p className="text-sm text-[#131313]">{userDetails.company}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Affiliate Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#131313] mb-3">Affiliate Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {userDetails.referrer && (
                    <div>
                      <p className="text-xs text-[#6c727f] mb-1">Referred By</p>
                      <p className="text-sm text-[#131313]">{userDetails.referrer.name} ({userDetails.referrer.email})</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Total Orders</p>
                    <p className="text-sm text-[#131313]">{userDetails.total_orders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Total Commissions</p>
                    <p className="text-sm text-[#131313]">${userDetails.total_commissions.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6c727f] mb-1">Referrals</p>
                    <p className="text-sm text-[#131313]">{userDetails.referral_count}</p>
                  </div>
                </div>
              </div>

              {/* Payment & Tax Information */}
              {(userDetails.payment_details || userDetails.tax_id) && (
                <div>
                  <h3 className="text-sm font-semibold text-[#131313] mb-3">Payment & Tax Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {userDetails.payment_details && (
                      <div className="col-span-2">
                        <p className="text-xs text-[#6c727f] mb-1">Payment Details</p>
                        <p className="text-sm text-[#131313] break-all">{userDetails.payment_details}</p>
                      </div>
                    )}
                    {userDetails.tax_id_type && (
                      <div>
                        <p className="text-xs text-[#6c727f] mb-1">Tax ID Type</p>
                        <p className="text-sm text-[#131313]">{userDetails.tax_id_type}</p>
                      </div>
                    )}
                    {userDetails.tax_id && (
                      <div>
                        <p className="text-xs text-[#6c727f] mb-1">Tax ID</p>
                        <p className="text-sm text-[#131313]">{userDetails.tax_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {userDetails.affiliate_status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-[#e6e6e6]">
                  <Button
                    className="flex-1 bg-[#3ba321] hover:bg-[#2d7a1a] text-white"
                    onClick={() => {
                      handleApprove(userDetails.ID)
                      setViewDialogOpen(false)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve User
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to reject this user?')) {
                        handleReject(userDetails.ID)
                        setViewDialogOpen(false)
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject User
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

