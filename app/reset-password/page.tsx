'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ResetPasswordForm } from "@/components/reset-password-form"
import { api } from '@/lib/api'

function ResetPasswordContent() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser()
        if (user) {
          // User is logged in - redirect to dashboard
          if (user.role === 'super_admin') {
            router.push('/dashboard/admin')
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        // Not logged in - allow access to reset password page
      }
    }
    
    checkAuth()
  }, [router])

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Form Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col overflow-y-auto">
        <ResetPasswordForm />
      </div>

      {/* Image Section - Hidden on mobile, right side on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative h-screen">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nurse-smiling-31cXsqnfT0K77b48hkHUObSe618DK1.png"
          alt="Smiling healthcare professional in lab coat"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2861a9] mx-auto mb-4"></div>
          <p className="text-[#6c727f]">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

