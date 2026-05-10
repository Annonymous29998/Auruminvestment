-- Homepage support card copy (Admin → Payment methods). Safe to re-run.
alter table public.payment_display_settings
  add column if not exists support_card_title text not null default '';

alter table public.payment_display_settings
  add column if not exists support_card_subtitle text not null default '';
