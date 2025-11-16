import { Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function ProfileCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 bg-[#2861a9] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white">CM</span>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#131313]">ClearMeds</h2>
          <p className="text-sm text-[#6c727f] mt-1">Live Harder LLC</p>
          <p className="text-sm text-[#6c727f]">doug@liveharderhealth.com</p>
        </div>
      </div>

    </div>
  )
}
