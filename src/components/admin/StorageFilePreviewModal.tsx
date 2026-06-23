import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  createStorageSignedUrl,
  guessPreviewFileKind,
  type StorageBucket,
} from '@/lib/storagePreview'
import { userFacingErrorMessage } from '@/lib/uiCopy'

export type StorageFilePreviewTarget = {
  bucket: StorageBucket
  path: string
  title: string
  subtitle?: string
}

type Props = {
  target: StorageFilePreviewTarget | null
  onClose: () => void
}

export function StorageFilePreviewModal({ target, onClose }: Props) {
  const previewQ = useQuery({
    queryKey: ['admin', 'storage-preview', target?.bucket, target?.path],
    queryFn: () => createStorageSignedUrl(target!.bucket, target!.path),
    enabled: Boolean(target),
    staleTime: 60_000,
    retry: 1,
  })

  const url = previewQ.data ?? null
  const loading = previewQ.isLoading
  const error = previewQ.error ? userFacingErrorMessage(previewQ.error) : null
  const kind = target ? guessPreviewFileKind(target.path) : 'other'

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={target?.title ?? 'Preview'}
      description={target?.subtitle}
      className="max-w-3xl"
      overlayStackClassName="z-[110]"
    >
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-white/60">Loading preview…</div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-100 ring-1 ring-rose-400/20">{error}</div>
        ) : url && kind === 'image' ? (
          <div className="flex justify-center overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10">
            <img
              src={url}
              alt={target?.title ?? 'Document preview'}
              className="max-h-[min(65dvh,640px)] w-full object-contain"
            />
          </div>
        ) : url && kind === 'pdf' ? (
          <iframe
            title={target?.title ?? 'Document preview'}
            src={url}
            className="h-[min(65dvh,640px)] w-full rounded-2xl bg-white ring-1 ring-white/10"
          />
        ) : url ? (
          <div className="space-y-4 rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10">
            <p className="text-sm text-white/70">This file type is best opened in a new tab or downloaded.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--gold),var(--gold2))] px-5 text-sm font-semibold text-black"
            >
              Open file <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : null}

        {url && !loading ? (
          <div className="mt-4 flex justify-end">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-white/8 px-3 text-sm font-semibold text-white ring-1 ring-white/12 hover:bg-white/12"
            >
              Open in new tab
            </a>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
