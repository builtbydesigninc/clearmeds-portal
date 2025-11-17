"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState<string | null>(null)
  const [login, setLogin] = useState<string | null>(null)

  useEffect(() => {
    const keyParam = searchParams.get('key')
    const loginParam = searchParams.get('login')
    
    if (!keyParam || !loginParam) {
      setError("Invalid reset link. Please request a new password reset.")
    } else {
      setKey(keyParam)
      setLogin(loginParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!key || !login) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    
    setLoading(true)
    
    try {
      await api.resetPassword(key, login, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired. Please request a new one.")
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
          <h1 className="text-2xl md:text-3xl font-semibold text-[#131313] mb-2 md:mb-3">
            Reset Password
          </h1>
          <p className="text-[#6c727f] text-sm mb-6 md:mb-8">
            Enter your new password below.
          </p>

          {success ? (
            <div className="space-y-5 md:space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Your password has been reset successfully. You can now login with your new password.
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#2861a9] hover:bg-[#1f4d8a] text-white text-base font-medium rounded-lg"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#6c727f] text-sm">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                  minLength={8}
                />
                <p className="text-xs text-[#6c727f]">Must be at least 8 characters long</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#6c727f] text-sm">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#f8f8f8] border-0 h-12"
                  required
                  minLength={8}
                />
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
                disabled={loading || !key || !login}
                className="w-full h-12 bg-[#2861a9] hover:bg-[#1f4d8a] text-white text-base font-medium rounded-lg disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-[#6c727f] hover:text-[#2861a9] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
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

