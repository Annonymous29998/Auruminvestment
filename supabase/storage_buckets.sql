-- Private buckets + RLS for KYC and payment proof uploads.
-- Run in Supabase Dashboard → SQL → New query.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('kyc-documents', 'kyc-documents', false, 52428800, null),
  ('payment-proofs', 'payment-proofs', false, 52428800, null)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = coalesce(excluded.file_size_limit, storage.buckets.file_size_limit),
  allowed_mime_types = coalesce(excluded.allowed_mime_types, storage.buckets.allowed_mime_types);

drop policy if exists "storage_kyc_payment_insert_own" on storage.objects;
drop policy if exists "storage_kyc_payment_update_own" on storage.objects;
drop policy if exists "storage_kyc_payment_select_own_or_admin" on storage.objects;
drop policy if exists "storage_kyc_payment_delete_own" on storage.objects;

create policy "storage_kyc_payment_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('kyc-documents', 'payment-proofs')
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "storage_kyc_payment_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id in ('kyc-documents', 'payment-proofs')
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id in ('kyc-documents', 'payment-proofs')
  and split_part(name, '/', 1) = auth.uid()::text
);

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

create policy "storage_kyc_payment_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('kyc-documents', 'payment-proofs')
  and split_part(name, '/', 1) = auth.uid()::text
);
