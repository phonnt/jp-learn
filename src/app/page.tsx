import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { SetCard } from '@/components/sets/set-card'
import { ArrowRight, BookOpen, Brain, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredSets } = await supabase
    .from('sets')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-canvas-white">
      <section className="mx-auto max-w-screen-xl px-6 py-20 text-center">
        <h1 className="text-display font-medium tracking-tight text-charcoal">
          Học tiếng Nhật
          <br />
          <span className="text-fog">với flashcard thông minh</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-body-lg text-fog">
          Tạo bộ thẻ từ vựng, học với flashcard, kiểm tra với quiz và ghi nhớ lâu hơn với spaced repetition.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          {user ? (
            <Button size="lg" asChild className="rounded-buttons bg-primary-action-fill text-canvas-white hover:opacity-90">
              <Link href="/dashboard">
                Vào học ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="bg-primary-action-fill text-canvas-white hover:opacity-90">
                <Link href="/auth/register">Bắt đầu miễn phí</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="bg-paper-mist py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <BookOpen className="mx-auto h-10 w-10 text-charcoal" />
              <h3 className="mt-4 text-subheading font-medium text-charcoal">Tạo bộ thẻ</h3>
              <p className="mt-2 text-body text-fog">Tự tạo bộ thẻ từ vựng với từ và nghĩa, thêm cách đọc và ví dụ.</p>
            </div>
            <div className="text-center">
              <Brain className="mx-auto h-10 w-10 text-charcoal" />
              <h3 className="mt-4 text-subheading font-medium text-charcoal">Học thông minh</h3>
              <p className="mt-2 text-body text-fog">Flashcard, quiz, và spaced repetition giúp ghi nhớ lâu dài.</p>
            </div>
            <div className="text-center">
              <Sparkles className="mx-auto h-10 w-10 text-charcoal" />
              <h3 className="mt-4 text-subheading font-medium text-charcoal">Theo dõi tiến độ</h3>
              <p className="mt-2 text-body text-fog">Dashboard theo dõi số thẻ đã học, streak và thành tích.</p>
            </div>
          </div>
        </div>
      </section>

      {featuredSets && featuredSets.length > 0 && (
        <section className="border-t border-ash bg-canvas-white">
          <div className="mx-auto max-w-screen-xl space-y-6 px-6 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-sm font-medium text-charcoal">Bộ thẻ nổi bật</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sets">
                  Xem tất cả <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredSets.map((set) => (
                <SetCard key={set.id} set={set} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
