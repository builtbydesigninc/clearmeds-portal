"use client"

import { Copy, Share2, Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface ReferralCardProps {
  data?: {
    link: string;
    commissionRate: string;
  };
}

export function ReferralCard({ data }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = data?.link || "www.clearmeds/usernamereferral"
  const commissionRate = data?.commissionRate || "10%"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[#131313]">Referral Link</h3>
        <Badge variant="secondary" className="bg-[#cfdae9] text-[#2861a9] hover:bg-[#cfdae9]">
          {commissionRate}
        </Badge>
      </div>
      
      <p className="text-sm text-[#6c727f] mb-4">
        Refer your friends using the link below and earn commissions on purchases made by them
      </p>

      <div className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg p-3 border border-[#e6e6e6]">
        <div className="w-8 h-8 bg-[#2861a9] rounded flex items-center justify-center shrink-0">
          <Copy className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-[#2861a9] flex-1 truncate">{referralLink}</span>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleCopy}
          className="text-[#6c727f] hover:text-[#131313]"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
      {copied && (
        <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#e6e6e6]">
        <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#2861a9]">
          <Facebook className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#2861a9]">
          <Instagram className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#2861a9]">
          <Twitter className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#2861a9]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </Button>
      </div>
    </div>
  )
}
