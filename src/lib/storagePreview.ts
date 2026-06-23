import { getSupabase } from '@/lib/supabaseClient'

export type StorageBucket = 'kyc-documents' | 'payment-proofs'

export type PreviewFileKind = 'image' | 'pdf' | 'other'

export function normalizeStoragePath(path: string): string {
  return path.trim().replace(/^\/+/, '')
}

export function guessPreviewFileKind(path: string): PreviewFileKind {
  const lower = path.toLowerCase().split('?')[0] ?? ''
  if (/\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)$/.test(lower)) return 'image'
  if (/\.pdf$/.test(lower)) return 'pdf'
  return 'other'
}

/** Signed URL for inline preview (images/PDF in modal). Admins need storage SELECT policy. */
export async function createStorageSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const supabase = getSupabase()
  const objectPath = normalizeStoragePath(path)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, expiresInSeconds, {
    download: false,
  })
  if (error) throw error
  if (!data?.signedUrl) throw new Error('Unable to open this file.')
  return data.signedUrl
}
