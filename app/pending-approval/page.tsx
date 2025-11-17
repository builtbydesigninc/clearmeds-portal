'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 md:p-10 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-[#131313] mb-4">
          Account Pending Approval
        </h1>

        {/* Message */}
        <p className="text-[#6c727f] mb-6 leading-relaxed">
          Thank you for registering! Your account has been created successfully and is now pending admin approval.
        </p>

        <div className="bg-[#f8f8f8] rounded-lg p-6 mb-6 text-left">
          <h2 className="text-sm font-semibold text-[#131313] mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            What happens next?
          </h2>
          <ul className="space-y-3 text-sm text-[#6c727f]">
            <li className="flex items-start gap-2">
              <span className="text-[#2861a9] mt-1">•</span>
              <span>An admin will review your account information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2861a9] mt-1">•</span>
              <span>You'll receive an email notification once your account is approved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2861a9] mt-1">•</span>
              <span>After approval, you can log in and start earning commissions</span>
            </li>
          </ul>
        </div>

        {/* Email Notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900 mb-1">Check your email</p>
            <p className="text-xs text-blue-700">
              We'll send you an email notification as soon as your account is approved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/login">
            <button className="w-full bg-[#2861a9] hover:bg-[#1f4d8a] text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Go to Login Page
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-white border border-[#e6e6e6] hover:bg-[#f8f8f8] text-[#131313] font-medium py-3 px-4 rounded-lg transition-colors">
              Return to Home
            </button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-[#6c727f] mt-6">
          Questions? Contact support at{' '}
          <a href="mailto:support@clearmeds.com" className="text-[#2861a9] hover:underline">
            support@clearmeds.com
          </a>
        </p>
      </div>
    </div>
  )
}

