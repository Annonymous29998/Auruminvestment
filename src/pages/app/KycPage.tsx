import { useState } from 'react'
import type { FormEvent } from 'react'
import { Upload, FileCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { env, isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { createKycDocument, markOwnKycPending } from '@/lib/api'
import { uploadToBucket } from '@/lib/storage'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToastStore } from '@/stores/toastStore'

type DocType = 'government_id' | 'proof_of_address' | 'selfie'

export function KycPage() {
  const toast = useToastStore((s) => s.push)
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [docType, setDocType] = useState<DocType>('government_id')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      toast({ tone: 'warning', title: 'Select a file', message: 'Please choose a file to upload.' })
      return
    }
    if (!userId) {
      toast({ tone: 'warning', title: 'Sign in required', message: 'Please sign in to submit KYC.' })
      return
    }
    if (!isSupabaseConfigured) {
      toast({
        tone: 'warning',
        title: uiCopy.toastBackendTitle,
        message: uiCopy.toastBackendMessage,
      })
      return
    }

    setLoading(true)
    try {
      const safeName = file.name.replace(/[^\w.-]+/g, '_')
      const path = `${userId}/${docType}/${Date.now()}-${safeName}`
      const uploaded = await uploadToBucket({ bucket: 'kyc-documents', path, file })
      await createKycDocument({ userId, documentType: docType, storagePath: uploaded.path })
      await markOwnKycPending({ userId })
      toast({
        tone: 'success',
        title: 'KYC uploaded',
        message: 'Your document was uploaded successfully.',
      })
      setFile(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast({ tone: 'danger', title: 'Upload failed', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="KYC Verification"
        subtitle="Upload your documents to complete identity verification. KYC is required before withdrawals."
        right={<Badge tone={user?.kycStatus === 'approved' ? 'success' : user?.kycStatus === 'pending' ? 'warning' : user?.kycStatus === 'rejected' ? 'danger' : 'neutral'}>{(user?.kycStatus ?? 'not_submitted').toUpperCase()}</Badge>}
      />

      <Card className="ring-1 ring-white/10">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Upload document</CardTitle>
          <FileCheck2 className="h-5 w-5 text-gold" />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
                <option value="government_id">Government ID</option>
                <option value="proof_of_address">Proof of address</option>
                <option value="selfie">Selfie</option>
              </Select>
              <div className="text-xs text-white/55">Upload clear, readable images or PDFs.</div>
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/12">
                <div className="min-w-0 text-sm text-white/70">
                  {file ? <span className="truncate">{file.name}</span> : 'PNG, JPG, PDF supported'}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white">
                  <Upload className="h-4 w-4" />
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {!isSupabaseConfigured ? (
                <div className="text-xs text-white/55">
                  Document upload is unavailable until the app is fully connected. Ask your administrator to finish
                  setup, then refresh.
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <Button type="submit" variant="primary" className="w-full" disabled={loading || !isSupabaseConfigured}>
                {loading ? 'Uploading…' : 'Submit KYC for verification'}
              </Button>
              <div className="mt-3 text-xs leading-relaxed text-white/55">
                AML compliance notice: identity verification may be required based on transaction history and risk assessment. Support: {env.supportEmail}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
