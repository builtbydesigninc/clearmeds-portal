'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export default function AdminPayoutsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      fetchPayouts()
    }
    checkAuth()
  }, [])

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminPayouts()
      setPayouts(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load payouts")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayouts = async () => {
    if (!confirm('Are you sure you want to process all pending payouts?')) {
      return
    }
    setProcessing(true)
    try {
      await api.processPayouts()
      alert('Payouts processed successfully')
      fetchPayouts()
    } catch (err: any) {
      alert(err.message || 'Failed to process payouts')
    } finally {
      setProcessing(false)
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
      case 'completed':
        return <Badge className="bg-green-50 text-green-600 hover:bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50"><Clock className="w-3 h-3 mr-1" />Processing</Badge>
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-50 text-red-600 hover:bg-red-50"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#131313] mb-2">Payout Management</h1>
              <p className="text-[#6c727f]">Process and track affiliate payouts</p>
            </div>
            <Button
              onClick={handleProcessPayouts}
              disabled={processing}
              className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white"
            >
              {processing ? 'Processing...' : 'Process Pending Payouts'}
            </Button>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-lg border border-[#e6e6e6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f8f8] border-b border-[#e6e6e6]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">User ID</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Payment Method</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Reference</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Created</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-[#6c727f]">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-red-600">{error}</td>
                    </tr>
                  ) : payouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-[#6c727f]">No payouts found</td>
                    </tr>
                  ) : (
                    payouts.map((payout: any) => (
                      <tr key={payout.id} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                        <td className="p-4 text-[#131313]">#{payout.id}</td>
                        <td className="p-4 text-[#131313]">#{payout.user_id}</td>
                        <td className="p-4 text-[#3ba321] font-semibold">${payout.amount?.toLocaleString() || '0'}</td>
                        <td className="p-4 text-[#131313]">{payout.payment_method}</td>
                        <td className="p-4 text-[#6c727f]">{payout.reference || 'N/A'}</td>
                        <td className="p-4">{getStatusBadge(payout.status)}</td>
                        <td className="p-4 text-[#6c727f] text-sm">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-[#6c727f] text-sm">
                          {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : 'N/A'}
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

