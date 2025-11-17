'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Users, DollarSign, HandCoins, CreditCard, Clock, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      
      try {
        const data = await api.getAdminDashboard()
        setAdminData(data)
      } catch (err: any) {
        setError(err.message || "Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

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
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <DashboardSidebar />
        <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc2626] mx-auto mb-4"></div>
              <p className="text-[#6c727f]">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardSidebar />
        <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const stats = adminData?.stats || {}

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#131313] mb-2">Admin Dashboard</h1>
            <p className="text-[#6c727f]">Manage affiliates, commissions, and payouts</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Affiliates</p>
              <p className="text-3xl font-bold text-[#131313]">{stats.totalAffiliates || 0}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#3ba321]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Sales</p>
              <p className="text-3xl font-bold text-[#131313]">${stats.totalSales?.toLocaleString() || '0'}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <HandCoins className="w-6 h-6 text-[#9333ea]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Commissions</p>
              <p className="text-3xl font-bold text-[#131313]">${stats.totalCommissions?.toLocaleString() || '0'}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#f59e0b]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Payouts</p>
              <p className="text-3xl font-bold text-[#131313]">${stats.totalPayouts?.toLocaleString() || '0'}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#6366f1]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Active Referrals</p>
              <p className="text-3xl font-bold text-[#131313]">{stats.activeReferrals || 0}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#dc2626]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Pending Commissions</p>
              <p className="text-3xl font-bold text-[#131313]">{stats.pendingCommissions || 0}</p>
            </div>

            <Link href="/dashboard/admin/users?status=pending">
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm hover:border-[#2861a9] transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                </div>
                <p className="text-sm text-[#6c727f] mb-1">Pending User Approvals</p>
                <p className="text-3xl font-bold text-[#131313]">{stats.pendingUsers || 0}</p>
                <p className="text-xs text-[#6c727f] mt-2">Click to review →</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Commissions */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#131313]">Pending Commissions</h2>
                <Link href="/dashboard/admin/commissions?status=pending">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {adminData?.pendingCommissions?.slice(0, 5).map((commission: any) => (
                  <div key={commission.id} className="flex items-center justify-between p-3 bg-[#f8f8f8] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#131313]">Order #{commission.order_id}</p>
                      <p className="text-xs text-[#6c727f]">${commission.commission_amount?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#3ba321] hover:bg-[#2d7a1a] text-white"
                        onClick={async () => {
                          try {
                            await api.approveCommission(commission.id)
                            window.location.reload()
                          } catch (err) {
                            alert('Failed to approve commission')
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await api.rejectCommission(commission.id)
                            window.location.reload()
                          } catch (err) {
                            alert('Failed to reject commission')
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )) || <p className="text-sm text-[#6c727f]">No pending commissions</p>}
              </div>
            </div>

            {/* Processing Payouts */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#131313]">Processing Payouts</h2>
                <Link href="/dashboard/admin/payouts">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {adminData?.processingPayouts?.slice(0, 5).map((payout: any) => (
                  <div key={payout.id} className="flex items-center justify-between p-3 bg-[#f8f8f8] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#131313]">Payout #{payout.reference || payout.id}</p>
                      <p className="text-xs text-[#6c727f]">${payout.amount?.toLocaleString() || '0'}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      {payout.status}
                    </span>
                  </div>
                )) || <p className="text-sm text-[#6c727f]">No processing payouts</p>}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/commissions">
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <DollarSign className="w-8 h-8 text-[#2861a9] mb-2" />
                <h3 className="font-semibold text-[#131313] mb-1">Manage Commissions</h3>
                <p className="text-sm text-[#6c727f]">Approve or reject commissions</p>
              </div>
            </Link>
            <Link href="/dashboard/admin/users">
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Users className="w-8 h-8 text-[#2861a9] mb-2" />
                <h3 className="font-semibold text-[#131313] mb-1">Manage Users</h3>
                <p className="text-sm text-[#6c727f]">View and manage affiliates</p>
              </div>
            </Link>
            <Link href="/dashboard/admin/payouts">
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CreditCard className="w-8 h-8 text-[#2861a9] mb-2" />
                <h3 className="font-semibold text-[#131313] mb-1">Manage Payouts</h3>
                <p className="text-sm text-[#6c727f]">Process and track payouts</p>
              </div>
            </Link>
            <Link href="/dashboard/admin/settings">
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <TrendingUp className="w-8 h-8 text-[#2861a9] mb-2" />
                <h3 className="font-semibold text-[#131313] mb-1">Settings</h3>
                <p className="text-sm text-[#6c727f]">Configure commission rates</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

