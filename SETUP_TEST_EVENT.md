# Como inserir o evento de teste ANIMALZ Summit 2025

## Via Supabase Dashboard:

1. Vá para seu projeto Supabase (https://app.supabase.com)
2. Abra a aba "SQL Editor"
3. Clique em "New Query"
4. Cole o SQL abaixo:

```sql
-- Primeiro, obtenha o ID da sua organização
SELECT id FROM organizations LIMIT 1;

-- Se houver resultado, use esse ID no INSERT abaixo, substituindo {ORG_ID}
-- Se não encontrar organização, crie uma primeiro

-- Insert the event
INSERT INTO events (
  organization_id,
  name,
  slug,
  subtitle,
  short_description,
  full_description,
  category,
  status,
  starts_at,
  ends_at,
  doors_open_at,
  venue_name,
  venue_address,
  total_capacity,
  sold_tickets,
  age_rating,
  is_free,
  registration_mode,
  cover_url
) VALUES (
  '{ORG_ID}',
  'ANIMALZ Summit 2025',
  'animalz-summit-2025',
  'O maior evento de tecnologia e inovação',
  'Descubra as melhores práticas para transformar seu evento',
  'ANIMALZ Summit é o evento definitivo para profissionais de gestão de eventos.',
  'Tech',
  'published',
  '2025-06-15T09:00:00Z',
  '2025-06-17T18:00:00Z',
  '2025-06-15T08:30:00Z',
  'São Paulo Convention Center',
  '{"street": "Av. Brig. Faria Lima, 1000", "city": "São Paulo", "state": "SP"}',
  5000,
  0,
  '18',
  false,
  'both',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85'
);
```

5. Execute a query
6. Agora o evento estará visível em `yoursite.com/e/animalz-summit-2025`

## Ou via Supabase CLI (se configurado):

```bash
supabase migration up
```

Isso executará o arquivo `20260323_seed_test_event.sql` automaticamente.
