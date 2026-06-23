-- Allow admins to open KYC / payment proof files (signed URLs need storage SELECT).
-- Run once in Supabase SQL editor if "View" fails for administrators.

drop policy if exists "storage_kyc_payment_select_own_or_admin" on storage.objects;

create policy "storage_kyc_payment_select_own_or_admin"
on storage.objects for select
to authenticated
using (
  bucket_id in ('kyc-documents', 'payment-proofs')
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or public.is_admin()
  )
);
