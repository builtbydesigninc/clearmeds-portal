'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Receipt, Clock, Wallet, Calendar, Search, Filter, Download, Plus, Trash2, Edit, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { requireNonSuperAdmin } from '@/lib/auth'

export default function PaymentsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [paymentsData, setPaymentsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingMethodId, setEditingMethodId] = useState<number | null>(null)
  const [deletingMethodId, setDeletingMethodId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    // Bank account fields
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    accountHolder: '',
    accountType: '',
    // PayPal, Venmo, Zelle fields
    email: '',
    phone: '',
    username: '',
    details: {}
  })

  useEffect(() => {
    const checkAuth = async () => {
      await requireNonSuperAdmin()
    }
    checkAuth()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const data = await api.getPayments()
      setPaymentsData(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleAddPaymentMethod = async () => {
    // Validate based on payment type
    if (!formData.type) {
      setDialogError('Please select a payment type')
      return
    }

    if (formData.type === 'Bank Account') {
      if (!formData.bankName || !formData.accountNumber || !formData.routingNumber || !formData.accountHolder || !formData.accountType) {
        setDialogError('Please fill in all bank account fields')
        return
      }
      // Validate routing number (9 digits for US)
      if (formData.routingNumber.replace(/\D/g, '').length !== 9) {
        setDialogError('Routing number must be 9 digits')
        return
      }
      // Validate account number confirmation (only required when adding new, not when editing)
      if (editingMethodId === null && formData.accountNumber !== formData.confirmAccountNumber) {
        setDialogError('Account numbers do not match. Please confirm your account number.')
        return
      }
      if (editingMethodId === null && !formData.confirmAccountNumber) {
        setDialogError('Please confirm your account number')
        return
      }
    } else if (formData.type === 'PayPal') {
      if (!formData.email) {
        setDialogError('Please enter your PayPal email address')
        return
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setDialogError('Please enter a valid email address')
        return
      }
    } else if (formData.type === 'Venmo' || formData.type === 'Zelle') {
      if (!formData.email && !formData.phone) {
        setDialogError(`Please enter your ${formData.type} email or phone number`)
        return
      }
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setDialogError('Please enter a valid email address')
          return
        }
      }
      if (formData.phone) {
        const phoneRegex = /^[\d\s\-\(\)]+$/
        if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
          setDialogError('Please enter a valid phone number')
          return
        }
      }
    }

    setSubmitting(true)
    setDialogError(null)
    try {
      const payload: any = {
        type: formData.type,
        details: {}
      }

      if (formData.type === 'Bank Account') {
        // For bank accounts, include all details
        payload.bankName = formData.bankName
        payload.accountNumber = formData.accountNumber
        payload.routingNumber = formData.routingNumber
        payload.accountHolder = formData.accountHolder
        payload.accountType = formData.accountType
        payload.last4 = formData.accountNumber.slice(-4)
        payload.details = {
          accountType: formData.accountType,
          fullAccountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber
        }
      } else if (formData.type === 'PayPal') {
        payload.email = formData.email
        payload.last4 = formData.email.slice(-4) // Last 4 chars of email for display
        payload.details = {
          email: formData.email
        }
      } else if (formData.type === 'Venmo' || formData.type === 'Zelle') {
        if (formData.email) {
          payload.email = formData.email
          payload.last4 = formData.email.slice(-4)
        }
        if (formData.phone) {
          payload.phone = formData.phone
          if (!payload.last4) {
            payload.last4 = formData.phone.slice(-4)
          }
        }
        payload.details = {
          email: formData.email || '',
          phone: formData.phone || ''
        }
      }

      if (editingMethodId !== null) {
        // Update existing method
        await api.updatePaymentMethod(editingMethodId, payload)
      } else {
        // Add new method
        await api.addPaymentMethod(payload)
      }
      
      setAddMethodDialogOpen(false)
      setEditingMethodId(null)
      setFormData({ 
        type: '', 
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        accountHolder: '',
        accountType: '',
        email: '',
        phone: '',
        username: '',
        details: {} 
      })
      setDialogError(null)
      await fetchPayments()
    } catch (err: any) {
      setDialogError(err.message || `Failed to ${editingMethodId !== null ? 'update' : 'add'} payment method`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPaymentMethod = (method: any, index: number) => {
    setEditingMethodId(index)
    if (method.type === 'Bank Account' || method.type === 'bank_account') {
      setFormData({
        type: 'Bank Account',
        bankName: method.bankName || '',
        accountNumber: method.accountNumber || method.details?.fullAccountNumber || '',
        confirmAccountNumber: '', // Empty for editing - user doesn't need to confirm when editing
        routingNumber: method.routingNumber || method.details?.routingNumber || '',
        accountHolder: method.accountHolder || method.accountName || '',
        accountType: method.accountType || method.details?.accountType || '',
        email: '',
        phone: '',
        username: '',
        details: method.details || {}
      })
    } else if (method.type === 'PayPal') {
      setFormData({
        type: 'PayPal',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        accountHolder: '',
        accountType: '',
        email: method.email || method.details?.email || '',
        phone: '',
        username: '',
        details: method.details || {}
      })
    } else if (method.type === 'Venmo' || method.type === 'Zelle') {
      setFormData({
        type: method.type,
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        accountHolder: '',
        accountType: '',
        email: method.email || method.details?.email || '',
        phone: method.phone || method.details?.phone || '',
        username: '',
        details: method.details || {}
      })
    } else {
      setFormData({
        type: method.type,
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        accountHolder: '',
        accountType: '',
        email: '',
        phone: '',
        username: '',
        details: method.details || {}
      })
    }
    setAddMethodDialogOpen(true)
  }

  const handleDeletePaymentMethod = async () => {
    if (deletingMethodId === null) return

    setSubmitting(true)
    setDialogError(null)
    try {
      await api.deletePaymentMethod(deletingMethodId)
      setDeleteDialogOpen(false)
      setDeletingMethodId(null)
      await fetchPayments()
    } catch (err: any) {
      setDialogError(err.message || "Failed to delete payment method")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetPrimary = async (methodId: number) => {
    setSubmitting(true)
    setDialogError(null)
    try {
      await api.setPrimaryPaymentMethod(methodId)
      await fetchPayments()
    } catch (err: any) {
      setDialogError(err.message || "Failed to set primary payment method")
    } finally {
      setSubmitting(false)
    }
  }

  const paymentMethods = paymentsData?.methods || []
  const paymentHistory = paymentsData?.history || []

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
              <p className="text-3xl font-semibold text-[#131313]">
                ${paymentsData?.stats?.totalPaid?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Pending</p>
              <p className="text-3xl font-semibold text-[#131313]">
                ${paymentsData?.stats?.pending?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Next Payout</p>
              <p className="text-3xl font-semibold text-[#131313]">
                ${paymentsData?.stats?.nextPayout?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2861a9]" />
                </div>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Payout Date</p>
              <p className="text-xl font-semibold text-[#131313]">
                {paymentsData?.stats?.payoutDate || 'November 15, 2025'}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg p-6 lg:p-8 border border-[#e6e6e6] mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#131313]">Payment Methods</h2>
              <Button 
                className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white"
                onClick={() => setAddMethodDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.length === 0 ? (
                <div className="col-span-full text-center py-8 text-[#6c727f]">
                  No payment methods added yet
                </div>
              ) : (
                paymentMethods.map((method: any, index: number) => {
                  const isPrimary = method.isPrimary === true
                  return (
                    <div key={index} className={`bg-[#f8f8f8] rounded-lg p-6 border-2 flex flex-col items-center text-center relative ${isPrimary ? 'border-[#2861a9]' : 'border-[#e6e6e6]'}`}>
                      {isPrimary && (
                        <div className="absolute top-2 right-2 bg-[#2861a9] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Primary
                        </div>
                      )}
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <img src={method.logo || "/placeholder.svg"} alt={method.type} className="max-w-full max-h-full" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#131313] mb-2">
                        {method.type === 'bank_account' ? 'Bank Account' : method.type}
                      </h3>
                      {method.type === 'Bank Account' || method.type === 'bank_account' ? (
                        <>
                          {method.bankName && (
                            <p className="text-sm text-[#6c727f] mb-1">{method.bankName}</p>
                          )}
                          {method.accountHolder && (
                            <p className="text-sm text-[#6c727f] mb-1">{method.accountHolder}</p>
                          )}
                          {method.last4 || method.accountNumber ? (
                            <p className="text-sm text-[#6c727f] mb-4">
                              ****{method.last4 || method.accountNumber?.slice(-4) || ''}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        method.last4 && (
                          <p className="text-sm text-[#6c727f] mb-4">**** **** **** {method.last4}</p>
                        )
                      )}
                      <div className="flex flex-col gap-2 w-full mt-2">
                        {!isPrimary && (
                          <Button 
                            variant="outline"
                            className="w-full border-[#2861a9] text-[#2861a9] hover:bg-[#2861a9] hover:text-white"
                            onClick={() => handleSetPrimary(index)}
                            disabled={submitting}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Set as Primary
                          </Button>
                        )}
                        <div className="flex gap-2 w-full">
                          <Button 
                            className="flex-1 bg-[#2861a9] hover:bg-[#1f4a7f] text-white"
                            onClick={() => handleEditPaymentMethod(method, index)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => {
                              setDeletingMethodId(index)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-[#6c727f]">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-red-600">{error}</td>
                    </tr>
                  ) : paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-[#6c727f]">No payment history</td>
                    </tr>
                  ) : (
                    paymentHistory.map((payment: any, index: number) => (
                      <tr key={index} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                        <td className="py-4 px-4 text-sm text-[#131313]">{payment.date}</td>
                        <td className="py-4 px-4 text-sm text-[#6c727f]">{payment.reference}</td>
                        <td className="py-4 px-4 text-sm text-[#6c727f]">{payment.method}</td>
                        <td className="py-4 px-4 text-sm font-medium text-[#3ba321]">
                          ${typeof payment.amount === 'number' ? payment.amount.toLocaleString() : payment.amount}
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog 
        open={addMethodDialogOpen} 
        onOpenChange={(open) => {
          setAddMethodDialogOpen(open)
          if (!open) {
            setFormData({ 
              type: '', 
              bankName: '',
              accountNumber: '',
              confirmAccountNumber: '',
              routingNumber: '',
              accountHolder: '',
              accountType: '',
              email: '',
              phone: '',
              username: '',
              details: {} 
            })
            setEditingMethodId(null)
            setDialogError(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMethodId !== null ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
            <DialogDescription>
              {editingMethodId !== null ? 'Update your payment method details' : 'Add a new payment method to receive payouts'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Payment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    type: value,
                    // Reset fields when changing type
                    bankName: '',
                    accountNumber: '',
                    confirmAccountNumber: '',
                    routingNumber: '',
                    accountHolder: '',
                    accountType: '',
                    email: '',
                    phone: '',
                    username: ''
                  })
                  setDialogError(null)
                }}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Account">Bank Account</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'Bank Account' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="accountHolder"
                    placeholder="Enter account holder name"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger id="accountType" className="w-full">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Checking">Checking</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number (ABA) <span className="text-red-500">*</span></Label>
                  <Input
                    id="routingNumber"
                    placeholder="123456789"
                    value={formData.routingNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                      setFormData({ ...formData, routingNumber: value })
                    }}
                    maxLength={9}
                  />
                  <p className="text-xs text-[#6c727f]">9-digit ABA routing number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, accountNumber: value })
                    }}
                    type="text"
                  />
                </div>

                {editingMethodId === null && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmAccountNumber">Confirm Account Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="confirmAccountNumber"
                      placeholder="Re-enter account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, confirmAccountNumber: value })
                      }}
                      type="password"
                      className={formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber ? 'border-red-500' : ''}
                    />
                    {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                      <p className="text-xs text-red-600">Account numbers do not match</p>
                    )}
                  </div>
                )}
              </>
            ) : formData.type === 'PayPal' ? (
              <div className="space-y-2">
                <Label htmlFor="email">PayPal Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-[#6c727f]">Enter the email address associated with your PayPal account</p>
              </div>
            ) : formData.type === 'Venmo' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, phone: value })
                    }}
                  />
                  <p className="text-xs text-[#6c727f]">Enter your email or phone number (at least one required)</p>
                </div>
              </>
            ) : formData.type === 'Zelle' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, phone: value })
                    }}
                  />
                  <p className="text-xs text-[#6c727f]">Enter your email or phone number (at least one required)</p>
                </div>
              </>
            ) : null}

            {dialogError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {dialogError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddMethodDialogOpen(false)
                setFormData({ 
                  type: '', 
                  bankName: '',
                  accountNumber: '',
                  confirmAccountNumber: '',
                  routingNumber: '',
                  accountHolder: '',
                  accountType: '',
                  email: '',
                  phone: '',
                  username: '',
                  details: {} 
                })
                setDialogError(null)
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2861a9] hover:bg-[#1f4a7f] text-white"
              onClick={handleAddPaymentMethod}
              disabled={
                submitting || 
                !formData.type || 
                (formData.type === 'Bank Account' 
                  ? !formData.bankName || !formData.accountNumber || !formData.routingNumber || !formData.accountHolder || !formData.accountType
                  : formData.type === 'PayPal'
                  ? !formData.email
                  : (formData.type === 'Venmo' || formData.type === 'Zelle')
                  ? !formData.email && !formData.phone
                  : false)
              }
            >
              {submitting 
                ? (editingMethodId !== null ? 'Updating...' : 'Adding...') 
                : (editingMethodId !== null ? 'Update Payment Method' : 'Add Payment Method')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {dialogError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {dialogError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingMethodId(null)
                setDialogError(null)
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePaymentMethod}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
