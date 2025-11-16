import { SidebarProvider } from "@/components/dashboard-sidebar-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarProvider>{children}</SidebarProvider>
}
