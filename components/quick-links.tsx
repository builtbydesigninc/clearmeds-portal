"use client"

import { ExternalLink, Share2, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useState } from "react"

export function QuickLinks() {
  const [loadingShop, setLoadingShop] = useState(false)
  
  const handleShopClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoadingShop(true)
    try {
      const response = await api.getSSOUrl()
      if (response.sso_url) {
        window.open(response.sso_url, '_blank')
      }
    } catch (error) {
      console.error('Failed to get SSO URL:', error)
      // Fallback to shop URL without SSO
      window.open('https://clearmeds.advait.site', '_blank')
    } finally {
      setLoadingShop(false)
    }
  }

  const links = [
    { title: "COAs", url: "drive.google.com/drive/folders/JaO--SwqCEsFLoWRQDtbqI7L29g3eVq98H" },
    { title: "Wholesale Price List", url: "drive.google.com/drive/folders/JaO--SwqCEsFLoWRQDtbqI7L29g3eVq98H" },
    { title: "Marketing Library", url: "drive.google.com/drive/folders/JaO--SwqCEsFLoWRQDtbqI7L29g3eVq98H" },
    { title: "Support", url: "drive.google.com/drive/folders/JaO--SwqCEsFLoWRQDtbqI7L29g3eVq98H" },
    { title: "Support", url: "drive.google.com/drive/folders/JaO--SwqCEsFLoWRQDtbqI7L29g3eVq98H" },
  ]

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-[#131313] mb-4">Quick Links</h3>
      
      <div className="space-y-3">
        {/* Shop Link with SSO */}
        <div className="flex items-center justify-between py-3 border-b border-[#e6e6e6]">
          <div className="flex-1 min-w-0 mr-3">
            <h4 className="font-medium text-[#131313] text-sm mb-1 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </h4>
            <button
              onClick={handleShopClick}
              disabled={loadingShop}
              className="text-xs text-[#2861a9] hover:underline flex items-center gap-1 truncate disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">clearmeds.advait.site</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </button>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-[#6c727f] hover:text-[#131313]">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        
        {links.map((link, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-[#e6e6e6] last:border-0">
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="font-medium text-[#131313] text-sm mb-1">{link.title}</h4>
              <a 
                href={`https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#2861a9] hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{link.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 text-[#6c727f] hover:text-[#131313]">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
