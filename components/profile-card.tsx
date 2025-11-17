import { Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ProfileCardProps {
  data?: {
    name: string;
    email: string;
    company: string;
    avatar: string;
    affiliateId: string;
  };
}

export function ProfileCard({ data }: ProfileCardProps) {
  const initials = data?.name
    ? data.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CM';

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {data?.avatar ? (
          <img
            src={data.avatar}
            alt={data.name}
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-[#2861a9] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#131313]">{data?.name || 'ClearMeds'}</h2>
          <p className="text-sm text-[#6c727f] mt-1">{data?.company || 'Live Harder LLC'}</p>
          <p className="text-sm text-[#6c727f]">{data?.email || 'doug@liveharderhealth.com'}</p>
        </div>
      </div>
    </div>
  )
}
