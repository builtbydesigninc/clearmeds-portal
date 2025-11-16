import { Progress } from "@/components/ui/progress"

export function RankCard() {
  const currentAmount = 25500
  const nextRankAmount = 50000
  const percentage = (currentAmount / nextRankAmount) * 100

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-[#2861a9]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#131313]">Your Rank: #7</h3>
        <span className="text-sm text-[#6c727f]">
          ${currentAmount.toLocaleString()}/${nextRankAmount.toLocaleString()}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-2" />
      
      <p className="text-sm text-[#6c727f]">
        {percentage.toFixed(0)}% to next rank
      </p>
    </div>
  )
}
