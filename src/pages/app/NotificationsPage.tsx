import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/AuthProvider'
import { getNotifications } from '@/lib/api'

export function NotificationsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const q = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  return (
    <div>
      <PageHeader title="Notifications" subtitle="System alerts and verification updates." />

      {q.isError ? (
        <EmptyState
          icon={<Bell className="h-5 w-5 text-gold" />}
          title="Unable to load notifications"
          description="Please refresh the page."
        />
      ) : q.data?.length ? (
        <div className="space-y-3">
          {q.data.map((n) => (
            <div key={n.id} className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white/90">{n.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-white/70">{n.message}</div>
                    <div className="mt-3 text-xs text-white/55">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="shrink-0">
                    <Badge
                      tone={
                        n.tone === 'success'
                          ? 'success'
                          : n.tone === 'warning'
                            ? 'warning'
                            : n.tone === 'danger'
                              ? 'danger'
                              : 'neutral'
                      }
                    >
                      {n.read ? 'READ' : 'NEW'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-5 w-5 text-gold" />}
          title="No notifications"
          description="Verification updates and system alerts will appear here."
        />
      )}
    </div>
  )
}
