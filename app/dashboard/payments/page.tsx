'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Clock, Wallet, Calendar, Search, Filter, Download, Plus } from 'lucide-react'

export default function PaymentsPage() {
  const { isCollapsed } = useSidebarCollapse()

  const paymentMethods = [
    { type: 'Mastercard', last4: '6127', logo: '/mastercard-logo.png' },
    { type: 'Visa', last4: '6127', logo: '/visa-logo-generic.png' },
    { type: 'PayPal', last4: '6127', logo: '/paypal-logo.png' },
  ]

  const paymentHistory = [
    { date: '2025-10-25', reference: 'PAY-2024-10-001', method: 'Bank Transfer', amount: 367.5, status: 'completed' },
    { date: '2025-10-24', reference: 'PAY-2024-10-001', method: 'PayPal', amount: 283.5, status: 'completed' },
    { date: '2025-10-23', reference: 'PAY-2024-10-001', method: 'Bank Transfer', amount: 480, status: 'processing' },
    { date: '2025-10-22', reference: 'PAY-2024-10-001', method: 'Bank Transfer', amount: 247.5, status: 'completed' },
    { date: '2025-10-21', reference: 'PAY-2024-10-001', method: 'PayPal', amount: 420, status: 'declined' },
  ]

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Paid</p>
              <p className="text-3xl font-semibold text-[#131313]">$18,450</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Pending</p>
              <p className="text-3xl font-semibold text-[#131313]">$2,840</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Next Payout</p>
              <p className="text-3xl font-semibold text-[#131313]">$6,873</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Payout Date</p>
              <p className="text-xl font-semibold text-[#131313]">November 15, 2025</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg p-6 lg:p-8 border border-[#e6e6e6] mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#131313]">Payment Methods</h2>
              <Button className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-[#f8f8f8] rounded-lg p-6 border border-[#e6e6e6] flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <img src={method.logo || "/placeholder.svg"} alt={method.type} className="max-w-full max-h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#131313] mb-2">{method.type}</h3>
                  <p className="text-sm text-[#6c727f] mb-4">**** **** **** {method.last4}</p>
                  <Button className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg p-6 lg:p-8 border border-[#e6e6e6]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-[#131313]">Payment History</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c727f]" />
                  <Input
                    placeholder="Search"
                    className="pl-10 w-full sm:w-64 bg-[#f8f8f8] border-[#e6e6e6]"
                  />
                </div>
                <Button variant="outline" className="border-[#e6e6e6]">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white">
                  Export List
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e6e6e6]">
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Reference</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Method</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#6c727f]">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                      <td className="py-4 px-4 text-sm text-[#131313]">{payment.date}</td>
                      <td className="py-4 px-4 text-sm text-[#6c727f]">{payment.reference}</td>
                      <td className="py-4 px-4 text-sm text-[#6c727f]">{payment.method}</td>
                      <td className="py-4 px-4 text-sm font-medium text-[#3ba321]">${payment.amount}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-[#e7f1e4] text-[#3ba321]'
                              : payment.status === 'processing'
                              ? 'bg-[#cfdae9] text-[#2861a9]'
                              : 'bg-[#feeeee] text-[#ef5350]'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button size="sm" className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
