import { Progress } from "@/components/ui/progress"

interface RankCardProps {
  data?: {
    currentRank: number;
    currentAmount: number;
    nextRankAmount: number;
    percentage: number;
    nextRank: string;
  };
}

export function RankCard({ data }: RankCardProps) {
  const currentAmount = data?.currentAmount || 25500
  const nextRankAmount = data?.nextRankAmount || 50000
  const percentage = data?.percentage || (currentAmount / nextRankAmount) * 100
  const currentRank = data?.currentRank || 7

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-[#2861a9]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#131313]">Your Rank: #{currentRank}</h3>
        <span className="text-sm text-[#6c727f]">
          ${currentAmount.toLocaleString()}/${nextRankAmount.toLocaleString()}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-2" />
      
      <p className="text-sm text-[#6c727f]">
        {percentage.toFixed(0)}% to {data?.nextRank || 'next rank'}
      </p>
    </div>
  )
}
