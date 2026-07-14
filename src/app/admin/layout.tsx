import { RoleGuard } from '@/components/shared/role-guard'
import { Navbar } from '@/components/layout/navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['moderator', 'admin']}>
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </RoleGuard>
  )
}
