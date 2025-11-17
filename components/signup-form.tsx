"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { api } from "@/lib/api"

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    taxIdType: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    // Payment method fields
    paymentType: "",
    // Bank account fields
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    routingNumber: "",
    accountHolder: "",
    accountType: "",
    // PayPal, Venmo, Zelle fields
    paymentEmail: "",
    paymentPhone: "",
    password: "",
    referralCode: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Extract referrer ID from URL and pre-fill the field
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      // Pre-fill referral code field from URL parameter
      setFormData(prev => ({ ...prev, referralCode: ref }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      // Validate payment method
      if (!formData.paymentType) {
        setError('Please select a payment method')
        setLoading(false)
        return
      }

      if (formData.paymentType === 'Bank Account') {
        if (!formData.bankName || !formData.accountNumber || !formData.routingNumber || !formData.accountHolder || !formData.accountType) {
          setError('Please fill in all bank account fields')
          setLoading(false)
          return
        }
        if (formData.routingNumber.replace(/\D/g, '').length !== 9) {
          setError('Routing number must be 9 digits')
          setLoading(false)
          return
        }
        if (formData.accountNumber !== formData.confirmAccountNumber) {
          setError('Account numbers do not match. Please confirm your account number.')
          setLoading(false)
          return
        }
      } else if (formData.paymentType === 'PayPal') {
        if (!formData.paymentEmail) {
          setError('Please enter your PayPal email address')
          setLoading(false)
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.paymentEmail)) {
          setError('Please enter a valid email address')
          setLoading(false)
          return
        }
      } else if (formData.paymentType === 'Venmo' || formData.paymentType === 'Zelle') {
        if (!formData.paymentEmail && !formData.paymentPhone) {
          setError(`Please enter your ${formData.paymentType} email or phone number`)
          setLoading(false)
          return
        }
        if (formData.paymentEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(formData.paymentEmail)) {
            setError('Please enter a valid email address')
            setLoading(false)
            return
          }
        }
        if (formData.paymentPhone && formData.paymentPhone.replace(/\D/g, '').length < 10) {
          setError('Please enter a valid phone number')
          setLoading(false)
          return
        }
      }

      // Build payment method data
      let paymentMethod: any = {
        type: formData.paymentType,
        isPrimary: true,
        details: {}
      }

      if (formData.paymentType === 'Bank Account') {
        paymentMethod.bankName = formData.bankName
        paymentMethod.accountNumber = formData.accountNumber
        paymentMethod.routingNumber = formData.routingNumber
        paymentMethod.accountHolder = formData.accountHolder
        paymentMethod.accountType = formData.accountType
        paymentMethod.last4 = formData.accountNumber.slice(-4)
        paymentMethod.details = {
          accountType: formData.accountType,
          fullAccountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber
        }
      } else if (formData.paymentType === 'PayPal') {
        paymentMethod.email = formData.paymentEmail
        paymentMethod.last4 = formData.paymentEmail.slice(-4)
        paymentMethod.details = {
          email: formData.paymentEmail
        }
      } else if (formData.paymentType === 'Venmo' || formData.paymentType === 'Zelle') {
        if (formData.paymentEmail) {
          paymentMethod.email = formData.paymentEmail
          paymentMethod.last4 = formData.paymentEmail.slice(-4)
        }
        if (formData.paymentPhone) {
          paymentMethod.phone = formData.paymentPhone
          if (!paymentMethod.last4) {
            paymentMethod.last4 = formData.paymentPhone.slice(-4)
          }
        }
        paymentMethod.details = {
          email: formData.paymentEmail || '',
          phone: formData.paymentPhone || ''
        }
      }

      // Use referral code from form input (could be from URL or manually entered)
      // Trim and only send if not empty
      const referralCode = formData.referralCode?.trim()
      
      await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        taxIdType: formData.taxIdType || undefined,
        taxId: formData.taxId || undefined,
        paymentMethod: paymentMethod,
        password: formData.password,
        referrerId: referralCode || undefined // Only send if not empty
      })
      // Redirect to pending approval page - user needs admin approval before login
      router.push("/pending-approval")
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 md:px-10 md:py-8 lg:px-12 lg:py-10">
        <div className="flex items-center">
          <Image
            src="/logo-clearmeds.png"
            alt="ClearMeds"
            width={180}
            height={48}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6 pb-6 md:px-10 md:pb-10 lg:px-12 lg:pb-12 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#131313] mb-6 md:mb-8">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#6c727f] text-sm">
                  First Name <span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#6c727f] text-sm">
                  Last Name <span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
            </div>

            {/* Tax ID Type & Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxIdType" className="text-[#6c727f] text-sm">
                  Is your Tax ID an EIN or Social? <span className="text-[#131313]">*</span>
                </Label>
                <Select
                  value={formData.taxIdType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, taxIdType: value })
                  }
                >
                  <SelectTrigger className="bg-[#f8f8f8] border-0 h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ein">EIN</SelectItem>
                    <SelectItem value="ssn">Social Security Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-[#6c727f] text-sm">
                  Tax Identification Number
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#6c727f] text-sm">
                  Email<span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#6c727f] text-sm">
                  Phone<span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#6c727f] text-sm">
                Address<span className="text-[#131313]">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="bg-[#f8f8f8] border-0 h-12"
                required
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#6c727f] text-sm">
                  City<span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-[#6c727f] text-sm">
                  State<span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-[#6c727f] text-sm">
                  Zip Code<span className="text-[#131313]">*</span>
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                />
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="space-y-4 border-t border-[#e6e6e6] pt-6">
              <h3 className="text-lg font-semibold text-[#131313]">Payment Method</h3>
              
              <div className="space-y-2">
                <Label htmlFor="paymentType" className="text-[#6c727f] text-sm">
                  Payment Type <span className="text-[#131313]">*</span>
                </Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      paymentType: value,
                      // Reset payment fields when changing type
                      bankName: '',
                      accountNumber: '',
                      confirmAccountNumber: '',
                      routingNumber: '',
                      accountHolder: '',
                      accountType: '',
                      paymentEmail: '',
                      paymentPhone: ''
                    })
                    setError(null)
                  }}
                >
                  <SelectTrigger className="bg-[#f8f8f8] border-0 h-12">
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

              {formData.paymentType === 'Bank Account' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-[#6c727f] text-sm">
                      Bank Name <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="bankName"
                      placeholder="Enter bank name"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="bg-[#f8f8f8] border-0 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolder" className="text-[#6c727f] text-sm">
                      Account Holder Name <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="accountHolder"
                      placeholder="Enter account holder name"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="bg-[#f8f8f8] border-0 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType" className="text-[#6c727f] text-sm">
                      Account Type <span className="text-[#131313]">*</span>
                    </Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                    >
                      <SelectTrigger className="bg-[#f8f8f8] border-0 h-12">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Checking">Checking</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routingNumber" className="text-[#6c727f] text-sm">
                      Routing Number (ABA) <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="routingNumber"
                      placeholder="123456789"
                      value={formData.routingNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                        setFormData({ ...formData, routingNumber: value })
                      }}
                      maxLength={9}
                      className="bg-[#f8f8f8] border-0 h-12"
                      required
                    />
                    <p className="text-xs text-[#6c727f]">9-digit ABA routing number</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-[#6c727f] text-sm">
                      Account Number <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, accountNumber: value })
                      }}
                      type="text"
                      className="bg-[#f8f8f8] border-0 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmAccountNumber" className="text-[#6c727f] text-sm">
                      Confirm Account Number <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="confirmAccountNumber"
                      placeholder="Re-enter account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, confirmAccountNumber: value })
                      }}
                      type="password"
                      className={`bg-[#f8f8f8] border-0 h-12 ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber ? 'border-red-500' : ''}`}
                      required
                    />
                    {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                      <p className="text-xs text-red-600">Account numbers do not match</p>
                    )}
                  </div>
                </>
              )}

              {formData.paymentType === 'PayPal' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentEmail" className="text-[#6c727f] text-sm">
                    PayPal Email <span className="text-[#131313]">*</span>
                  </Label>
                  <Input
                    id="paymentEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.paymentEmail}
                    onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                    className="bg-[#f8f8f8] border-0 h-12"
                    required
                  />
                  <p className="text-xs text-[#6c727f]">Enter the email address associated with your PayPal account</p>
                </div>
              )}

              {(formData.paymentType === 'Venmo' || formData.paymentType === 'Zelle') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="paymentEmail" className="text-[#6c727f] text-sm">
                      Email <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="paymentEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.paymentEmail}
                      onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                      className="bg-[#f8f8f8] border-0 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentPhone" className="text-[#6c727f] text-sm">
                      Phone Number <span className="text-[#131313]">*</span>
                    </Label>
                    <Input
                      id="paymentPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.paymentPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, paymentPhone: value })
                      }}
                      className="bg-[#f8f8f8] border-0 h-12"
                    />
                    <p className="text-xs text-[#6c727f]">Enter your email or phone number (at least one required)</p>
                  </div>
                </>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#6c727f] text-sm">
                Password <span className="text-[#131313]">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-[#f8f8f8] border-0 h-12"
                required
              />
            </div>

            {/* Referral Code (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-[#6c727f] text-sm">
                Referral Code <span className="text-[#6c727f] text-xs">(Optional)</span>
              </Label>
              <Input
                id="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={(e) =>
                  setFormData({ ...formData, referralCode: e.target.value })
                }
                placeholder="e.g., AFF-2025-0020"
                className="bg-[#f8f8f8] border-0 h-12"
              />
              <p className="text-xs text-[#6c727f]">
                Have a referral code? Enter it here. Leave blank if signing up directly.
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    agreeToTerms: checked as boolean,
                  })
                }
                className="mt-1"
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm text-[#6c727f] cursor-pointer leading-relaxed"
              >
                I agree to the terms and conditions <span className="text-[#131313]">*</span>
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#2861a9] hover:bg-[#1f4d8a] text-white text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Info Text */}
            {formData.referralCode && (
              <p className="text-center text-xs text-[#6c727f] bg-blue-50 p-3 rounded">
                ℹ️ Signing up with referral code: <span className="font-semibold">{formData.referralCode}</span>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 md:px-10 md:py-6 lg:px-12 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-[#6c727f]">
        <a href="#" className="hover:underline">
          Terms & Conditions
        </a>
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  )
}
