'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { SignupForm } from "@/components/signup-form"
import { api } from '@/lib/api'

function RegisterContent() {
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
        // Not logged in - allow access to registration page
        // Silently ignore errors (user needs to register)
      }
    }
    
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:w-1/2 bg-white">
        <SignupForm />
      </div>

      {/* Image Section - Hidden on mobile, right side on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rTIU8MBuN1iogGUGUmtjwSN0CLgxeH.png"
          alt="Smiling patient in healthcare consultation"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2861a9] mx-auto mb-4"></div>
          <p className="text-[#6c727f]">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}

