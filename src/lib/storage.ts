import { getSupabase } from '@/lib/supabaseClient'

export async function uploadToBucket(args: {
  bucket: string
  path: string
  file: File
}): Promise<{ path: string }> {
  const supabase = getSupabase()
  const { error } = await supabase.storage.from(args.bucket).upload(args.path, args.file, {
    upsert: true,
    contentType: args.file.type || undefined,
  })
  if (error) throw error
  return { path: args.path }
}
