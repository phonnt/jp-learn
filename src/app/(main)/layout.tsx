import { Navbar } from '@/components/layout/navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
