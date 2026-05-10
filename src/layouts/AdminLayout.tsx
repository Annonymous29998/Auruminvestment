import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

export function AdminLayout() {
  return (
    <div className="min-h-dvh">
      <div className="flex">
        <DashboardSidebar mode="admin" />
        <div className="min-w-0 flex-1">
          <DashboardTopbar admin />
          <div className="aurum-container py-4 sm:py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
