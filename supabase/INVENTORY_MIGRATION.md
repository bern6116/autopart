# Inventory transaction migration

Apply `migrations/202610120001_inventory_transactions.sql` in the Supabase SQL Editor after the original `lib/supabase-schema.sql` schema.

## Before applying

Run these reconciliation queries. The migration uses `products.stock_quantity` as the canonical stock balance and does not invent opening movements.

```sql
select id, sku, stock_quantity, reorder_level
from public.products
where stock_quantity < 0 or reorder_level < 0;

select p.id, p.sku, p.stock_quantity, i.current_stock, i.available_stock
from public.products p
join public.inventory i on i.product_id = p.id
where p.stock_quantity is distinct from i.current_stock
   or p.stock_quantity is distinct from i.available_stock;

select id, purchase_id, quantity_ordered, quantity_received
from public.purchase_items
where quantity_ordered <= 0
   or quantity_received < 0
   or quantity_received > quantity_ordered;
```

Resolve every returned row before validating the new constraints. After reconciliation, run:

```sql
alter table public.products validate constraint products_stock_quantity_nonnegative;
alter table public.products validate constraint products_reorder_level_nonnegative;
alter table public.purchase_items validate constraint purchase_items_quantity_ordered_positive;
alter table public.purchase_items validate constraint purchase_items_received_valid;
```

## Operational notes

- Existing balances are not inserted into `stock_movements`. Record a real, reasoned adjustment if reconciliation changes a balance.
- Checkout currently accepts only cash on delivery. Card and online payments require a verified server-side payment provider/webhook before they can safely confirm payment.
- The migration removes the legacy purchase and POS stock triggers because they update the duplicate `inventory` balance. New stock-changing code must use the transaction RPCs.
- Admin RPCs require a real Supabase session and an active protected role in `profiles`; the existing demo admin cookie is not sufficient authorization.
- Do not expose a service-role key in the browser.
