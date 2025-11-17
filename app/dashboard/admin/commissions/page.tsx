'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { useSearchParams } from 'next/navigation'

export default function AdminCommissionsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const searchParams = useSearchParams()
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      fetchCommissions()
    }
    checkAuth()
  }, [statusFilter, page])

  const fetchCommissions = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminCommissions({
        status: statusFilter || undefined,
        page,
        limit: 20
      })
      setCommissions(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load commissions")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await api.approveCommission(id)
      fetchCommissions()
    } catch (err: any) {
      alert(err.message || 'Failed to approve commission')
    }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this commission?')) {
      return
    }
    try {
      await api.rejectCommission(id)
      fetchCommissions()
    } catch (err: any) {
      alert(err.message || 'Failed to reject commission')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-50 text-green-600 hover:bg-green-50">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">Pending</Badge>
      case 'declined':
        return <Badge className="bg-red-50 text-red-600 hover:bg-red-50">Declined</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#131313] mb-2">Commission Management</h1>
            <p className="text-[#6c727f]">Review and manage affiliate commissions</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c727f]" />
                <Input
                  placeholder="Search by order ID or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  className={statusFilter === 'approved' ? 'bg-[#2861a9] text-white' : ''}
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'declined' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('declined')}
                  className={statusFilter === 'declined' ? 'bg-[#2861a9] text-white' : ''}
                >
                  Declined
                </Button>
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
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">User ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Order Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Commission Rate</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Commission Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Level</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-[#6c727f]">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-red-600">{error}</td>
                    </tr>
                  ) : commissions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-[#6c727f]">No commissions found</td>
                    </tr>
                  ) : (
                    commissions.map((commission: any) => (
                      <tr key={commission.id} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                        <td className="p-4 text-[#131313]">#{commission.id}</td>
                        <td className="p-4 text-[#131313]">#{commission.user_id}</td>
                        <td className="p-4 text-[#131313]">#{commission.order_id}</td>
                        <td className="p-4 text-[#131313]">${commission.order_amount?.toLocaleString() || '0'}</td>
                        <td className="p-4 text-[#131313]">{commission.commission_rate}%</td>
                        <td className="p-4 text-[#3ba321] font-semibold">${commission.commission_amount?.toLocaleString() || '0'}</td>
                        <td className="p-4 text-[#131313]">Level {commission.level}</td>
                        <td className="p-4">{getStatusBadge(commission.status)}</td>
                        <td className="p-4 text-[#6c727f] text-sm">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {commission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-[#3ba321] hover:bg-[#2d7a1a] text-white"
                                onClick={() => handleApprove(commission.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(commission.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
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
    </>
  )
}

