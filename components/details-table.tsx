"use client"

import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DetailsTable() {
  const transactions = [
    { date: "2025-10-25", customer: "Wellness Clinic NYC", orderNumber: "ORD-2024-8821", amount: "$2,450", commission: "$367.5", status: "completed" },
    { date: "2025-10-24", customer: "HealthFirst Medical", orderNumber: "ORD-2024-8820", amount: "$1,890", commission: "$283.5", status: "completed" },
    { date: "2025-10-23", customer: "Vitality Health Center", orderNumber: "ORD-2024-8819", amount: "$3,200", commission: "$480", status: "processing" },
    { date: "2025-10-22", customer: "Downtown Medical Group", orderNumber: "ORD-2024-8818", amount: "$1,650", commission: "$247.5", status: "completed" },
    { date: "2025-10-21", customer: "Metro Health Solutions", orderNumber: "ORD-2024-8817", amount: "$2,800", commission: "$420", status: "declined" },
    { date: "2025-10-25", customer: "Wellness Clinic NYC", orderNumber: "ORD-2024-8821", amount: "$2,450", commission: "$367.5", status: "completed" },
    { date: "2025-10-24", customer: "HealthFirst Medical", orderNumber: "ORD-2024-8820", amount: "$1,890", commission: "$283.5", status: "completed" },
    { date: "2025-10-23", customer: "Vitality Health Center", orderNumber: "ORD-2024-8819", amount: "$3,200", commission: "$480", status: "processing" },
    { date: "2025-10-22", customer: "Downtown Medical Group", orderNumber: "ORD-2024-8818", amount: "$1,650", commission: "$247.5", status: "completed" },
    { date: "2025-10-21", customer: "Metro Health Solutions", orderNumber: "ORD-2024-8817", amount: "$2,800", commission: "$420", status: "declined" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-[#e7f1e4] text-[#3ba321] hover:bg-[#e7f1e4]">completed</Badge>
      case "processing":
        return <Badge className="bg-[#cfdae9] text-[#2861a9] hover:bg-[#cfdae9]">processing</Badge>
      case "declined":
        return <Badge className="bg-[#feeeee] text-[#ef5350] hover:bg-[#feeeee]">declined</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e6e6e6]">
        <h3 className="font-semibold text-[#131313] mb-4">Details</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c727f]" />
            <Input 
              placeholder="Search" 
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2 bg-[#2861a9] hover:bg-[#2861a9]/90">
            <Download className="w-4 h-4" />
            Export List
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="text-[#6c727f]">{transaction.date}</TableCell>
                <TableCell className="font-medium text-[#131313]">{transaction.customer}</TableCell>
                <TableCell className="text-[#6c727f]">{transaction.orderNumber}</TableCell>
                <TableCell className="text-[#131313]">{transaction.amount}</TableCell>
                <TableCell className="text-green-600 font-medium">{transaction.commission}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-[#e6e6e6] flex items-center justify-between">
        <Select defaultValue="10">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
