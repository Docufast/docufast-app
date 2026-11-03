-- Customers may insert only these columns on a new order.
-- 20261014 allowed six columns; 20261024 added speed (standard or express) and the trigger that
-- protects the server fields, but never granted it, so affidavit orders failed with
-- "permission denied for table orders". This makes the grant explicit and removes any
-- table-wide INSERT (which would also let a customer write quote_amount).
begin;
revoke insert on public.orders from anon, authenticated;
grant insert (user_id, entity_id, service_category, order_type, status, speed, form_data)
  on public.orders to authenticated;
commit;
