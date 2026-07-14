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
    <div className="bg-canvas">
      <section className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-screen-xl px-6 py-20 text-center">
          <h1 className="text-display font-semibold tracking-tight text-ink">
            Học tiếng Nhật
            <br />
            <span className="text-mid-gray">với flashcard thông minh</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-mid-gray">
            Tạo bộ thẻ từ vựng, học với flashcard, kiểm tra với quiz và ghi nhớ lâu hơn với spaced repetition.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Vào học ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/auth/register">Bắt đầu miễn phí</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <BookOpen className="mx-auto h-10 w-10 text-ink" />
            <h3 className="mt-4 text-lg font-semibold text-ink">Tạo bộ thẻ</h3>
            <p className="mt-2 text-sm text-mid-gray">Tự tạo bộ thẻ từ vựng với từ và nghĩa, thêm cách đọc và ví dụ.</p>
          </div>
          <div className="text-center">
            <Brain className="mx-auto h-10 w-10 text-ink" />
            <h3 className="mt-4 text-lg font-semibold text-ink">Học thông minh</h3>
            <p className="mt-2 text-sm text-mid-gray">Flashcard, quiz, và spaced repetition giúp ghi nhớ lâu dài.</p>
          </div>
          <div className="text-center">
            <Sparkles className="mx-auto h-10 w-10 text-ink" />
            <h3 className="mt-4 text-lg font-semibold text-ink">Theo dõi tiến độ</h3>
            <p className="mt-2 text-sm text-mid-gray">Dashboard theo dõi số thẻ đã học, streak và thành tích.</p>
          </div>
        </div>
      </section>

      {featuredSets && featuredSets.length > 0 && (
        <section className="border-t border-hairline bg-paper">
          <div className="mx-auto max-w-screen-xl space-y-6 px-6 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-sm font-semibold text-ink">Bộ thẻ nổi bật</h2>
              <Button variant="ghost" asChild>
                <Link href="/sets">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
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
