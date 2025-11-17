'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export default function PendingCommissionsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      fetchPendingCommissions()
    }
    checkAuth()
  }, [page])

  const fetchPendingCommissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getAdminPendingCommissions({
        page,
        limit: 20
      })
      setCommissions(data.commissions || [])
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message || "Failed to load pending commissions")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    if (processing === id) return
    
    setProcessing(id)
    try {
      await api.approveCommission(id)
      // Remove the approved commission from the list
      setCommissions(commissions.filter(c => c.id !== id))
      if (pagination) {
        setPagination({
          ...pagination,
          total: pagination.total - 1
        })
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve commission')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    if (processing === id) return
    
    if (!confirm('Are you sure you want to reject this commission?')) {
      return
    }
    
    setProcessing(id)
    try {
      await api.rejectCommission(id)
      // Remove the rejected commission from the list
      setCommissions(commissions.filter(c => c.id !== id))
      if (pagination) {
        setPagination({
          ...pagination,
          total: pagination.total - 1
        })
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject commission')
    } finally {
      setProcessing(null)
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

  const totalAmount = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0)

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-[#131313]">Pending Commissions</h1>
            </div>
            <p className="text-[#6c727f]">Review and approve or reject pending commission requests</p>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[#6c727f] mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-[#131313]">{pagination?.total || commissions.length}</p>
              </div>
              <div>
                <p className="text-sm text-[#6c727f] mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#3ba321]">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-[#6c727f] mb-1">Current Page</p>
                <p className="text-2xl font-bold text-[#131313]">{page} / {pagination?.total_pages || 1}</p>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-lg border border-[#e6e6e6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f8f8] border-b border-[#e6e6e6]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">User</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Order Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Rate</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Commission</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Level</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#6c727f]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]"></div>
                          <p>Loading pending commissions...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-red-600">
                          <AlertCircle className="w-8 h-8" />
                          <p>{error}</p>
                          <Button onClick={fetchPendingCommissions} variant="outline" size="sm">
                            Retry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : commissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#6c727f]">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="w-12 h-12 text-green-500" />
                          <p className="text-lg font-medium">No pending commissions</p>
                          <p className="text-sm">All commissions have been processed</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission: any) => (
                      <tr key={commission.id} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                        <td className="p-4 text-[#131313] font-medium">#{commission.id}</td>
                        <td className="p-4">
                          <div>
                            <p className="text-[#131313] font-medium">{commission.user_name || `User #${commission.user_id}`}</p>
                            <p className="text-sm text-[#6c727f]">{commission.user_email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-[#131313]">#{commission.order_id}</td>
                        <td className="p-4 text-[#131313]">${commission.order_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                        <td className="p-4 text-[#131313]">{commission.commission_rate}%</td>
                        <td className="p-4">
                          <span className="text-[#3ba321] font-semibold">
                            ${commission.commission_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                            Level {commission.level}
                          </Badge>
                        </td>
                        <td className="p-4 text-[#6c727f] text-sm">
                          {new Date(commission.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#3ba321] hover:bg-[#2d7a1a] text-white"
                              onClick={() => handleApprove(commission.id)}
                              disabled={processing === commission.id}
                            >
                              {processing === commission.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleReject(commission.id)}
                              disabled={processing === commission.id}
                            >
                              {processing === commission.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="border-t border-[#e6e6e6] p-4 flex items-center justify-between">
                <p className="text-sm text-[#6c727f]">
                  Showing {((page - 1) * (pagination.limit || 20)) + 1} to {Math.min(page * (pagination.limit || 20), pagination.total)} of {pagination.total} commissions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.total_pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

