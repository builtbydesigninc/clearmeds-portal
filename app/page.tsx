'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Page() {
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
        } else {
          // User is not logged in - redirect to login
          router.push('/login')
        }
      } catch (error) {
        // Not logged in - redirect to login
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2861a9]"></div>
    </div>
  )
}
