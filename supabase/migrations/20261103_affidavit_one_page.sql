-- Every affidavit fits on ONE page (JSB, 3 Nov 2026).
-- The order form already stops customers at 1,200 characters (lib/affidavitGuide.ts,
-- PURPOSE_MAX_CHARS); this makes the database refuse longer statements too, because the form
-- inserts orders directly. NOT VALID: older orders are left as they are; new and updated rows are checked.
alter table public.orders
  add constraint orders_affidavit_purpose_one_page
  check (
    service_category <> 'affidavit'
    or form_data is null
    or coalesce(char_length(form_data->>'purpose'), 0) <= 1200
  ) not valid;
