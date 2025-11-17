'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from "@/components/login-form"
import { api } from '@/lib/api'

export default function LoginPage() {
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
        // Not logged in - allow access to login page
      }
    }
    
    checkAuth()
  }, [router])

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Form Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col overflow-y-auto">
        <LoginForm />
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

