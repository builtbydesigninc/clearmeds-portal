'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Search, Filter, Download, ChevronLeft, ChevronRight, Globe, DollarSign, HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { requireNonSuperAdmin } from '@/lib/auth'

export default function TransactionsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [searchQuery, setSearchQuery] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [transactionsData, setTransactionsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      await requireNonSuperAdmin()
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const data = await api.getTransactions({
          page,
          limit: itemsPerPage,
          search: searchQuery || undefined
        })
        setTransactionsData(data)
      } catch (err: any) {
        setError(err.message || "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [page, itemsPerPage, searchQuery])

  const transactionData = transactionsData?.transactions || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#e7f1e4] text-[#3ba321]'
      case 'processing':
        return 'bg-[#cfdae9] text-[#2861a9]'
      case 'declined':
        return 'bg-[#feeeee] text-[#ef5350]'
      default:
        return 'bg-[#e6e6e6] text-[#6c727f]'
    }
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 lg:ml-64 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Transactions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#e7f1e4] flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#2861a9]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#e7f1e4] text-[#3ba321] text-sm font-medium">
                  +33%
                </span>
              </div>
              <p className="text-[#6c727f] text-sm mb-1">Total Transactions</p>
              <p className="text-3xl font-semibold text-[#131313]">
                {transactionsData?.stats?.totalTransactions || 0}
              </p>
            </div>

            {/* Total Amount */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#e7f1e4] flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#2861a9]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#e7f1e4] text-[#3ba321] text-sm font-medium">
                  +33%
                </span>
              </div>
              <p className="text-[#6c727f] text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-semibold text-[#131313]">
                ${transactionsData?.stats?.totalAmount?.toLocaleString() || '0'}
              </p>
            </div>

            {/* Total Commission */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#feeeee] flex items-center justify-center">
                  <HandCoins className="w-6 h-6 text-[#2861a9]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#feeeee] text-[#ef5350] text-sm font-medium">
                  -24%
                </span>
              </div>
              <p className="text-[#6c727f] text-sm mb-1">Total Commission</p>
              <p className="text-3xl font-semibold text-[#131313]">
                ${transactionsData?.stats?.totalCommission?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e6e6e6] overflow-hidden">
            <div className="p-6 border-b border-[#e6e6e6]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-[#131313]">Transaction History</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c727f]" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setPage(1)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setPage(1)
                        }
                      }}
                      className="pl-10 w-full sm:w-64 bg-[#f8f8f8] border-[#e6e6e6]"
                    />
                  </div>
                  <Button variant="outline" className="border-[#e6e6e6] text-[#131313] hover:bg-[#f8f8f8]">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="bg-[#2861a9] hover:bg-[#1d4780] text-white">
                    Export List
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e6e6e6] bg-[#f8f8f8]">
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Order Number</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Commission</th>
                    <th className="text-left p-4 text-sm font-medium text-[#6c727f]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[#6c727f]">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-red-600">{error}</td>
                    </tr>
                  ) : transactionData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[#6c727f]">No transactions found</td>
                    </tr>
                  ) : (
                    transactionData.map((transaction: any, index: number) => (
                      <tr key={index} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8] transition-colors">
                        <td className="p-4 text-[#131313]">{transaction.date}</td>
                        <td className="p-4 text-[#131313]">{transaction.customer}</td>
                        <td className="p-4 text-[#6c727f]">{transaction.orderNumber}</td>
                        <td className="p-4 text-[#131313]">${typeof transaction.amount === 'number' ? transaction.amount.toLocaleString() : transaction.amount}</td>
                        <td className="p-4 text-[#3ba321] font-medium">${typeof transaction.commission === 'number' ? transaction.commission.toLocaleString() : transaction.commission}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#e6e6e6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-[#e6e6e6] rounded-lg text-sm bg-white text-[#131313]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-[#e6e6e6] hover:bg-[#f8f8f8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[#6c727f]">
                  Page {page} of {transactionsData?.pagination?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min((transactionsData?.pagination?.totalPages || 1), p + 1))}
                  disabled={page >= (transactionsData?.pagination?.totalPages || 1)}
                  className="border-[#e6e6e6] hover:bg-[#f8f8f8]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
