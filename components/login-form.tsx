"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const response = await api.login(formData.email, formData.password)
      // Redirect super_admin to admin dashboard, others to regular dashboard
      if (response.role === 'super_admin') {
        router.push("/dashboard/admin")
      } else {
      router.push("/dashboard")
      }
    } catch (err: any) {
      // Handle pending approval error
      if (err.message && err.message.includes('pending')) {
        setError("Your account is pending admin approval. Please wait for approval before logging in.")
      } else {
        setError(err.message || "Login failed. Please check your credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-screen lg:min-h-0">
      {/* Logo */}
      <div className="px-6 py-6 md:px-10 md:py-8 lg:px-12 lg:py-10 flex-shrink-0">
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
      <div className="flex-1 px-6 pb-6 md:px-10 md:pb-10 lg:px-12 lg:pb-12 flex items-center justify-center">
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
                  href="/forgot-password"
                  className="text-sm text-[#6c727f] hover:text-[#2861a9] hover:underline"
                >
                  Forgot Password
                </Link>
              </div>
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 md:px-10 md:py-6 lg:px-12 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-[#6c727f] flex-shrink-0">
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
