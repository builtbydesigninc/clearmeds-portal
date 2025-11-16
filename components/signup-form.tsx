"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
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

export function SignupForm() {
  const router = useRouter()
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
    paymentDetails: "",
    password: "",
    agreeToTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 md:px-10 md:py-8 lg:px-12 lg:py-10">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="10" r="3" fill="#2861a9" />
            <circle cx="16" cy="22" r="3" fill="#2861a9" />
            <circle cx="10" cy="16" r="3" fill="#2861a9" />
            <circle cx="22" cy="16" r="3" fill="#2861a9" />
            <path
              d="M16 13 L16 19 M13 16 L19 16"
              stroke="#2861a9"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xl md:text-2xl font-semibold text-[#131313]">
            ClearMeds
          </span>
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

            {/* Payment Details */}
            <div className="space-y-2">
              <Label htmlFor="paymentDetails" className="text-[#6c727f] text-sm">
                Payment Details <span className="text-[#131313]">*</span>
              </Label>
              <Input
                id="paymentDetails"
                value={formData.paymentDetails}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDetails: e.target.value })
                }
                className="bg-[#f8f8f8] border-0 h-12"
                required
              />
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#2861a9] hover:bg-[#1f4d8a] text-white text-base font-medium rounded-lg"
            >
              Create Account
            </Button>

            {/* Sponsor Text */}
            <p className="text-center text-xs text-[#847f7f]">
              sponsored by [name] of first [higher] affiliate.
            </p>
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
