"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      <div className="flex-1 px-6 pb-6 md:px-10 md:pb-10 lg:px-12 lg:pb-12 flex items-start lg:items-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-sm p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#131313] mb-6 md:mb-8">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#6c727f] text-sm">
                Email Address
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#6c727f] text-sm">
                Password
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
              <div className="flex justify-end">
                <Link
                  href="#"
                  className="text-sm text-[#6c727f] hover:text-[#2861a9] hover:underline"
                >
                  Forgot Password
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#2861a9] hover:bg-[#1f4d8a] text-white text-base font-medium rounded-lg"
            >
              Login
            </Button>
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
