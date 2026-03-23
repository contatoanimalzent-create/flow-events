-- Seed test event for ANIMALZ EVENTS
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
  cover_url,
  settings
) VALUES (
  (SELECT id FROM organizations LIMIT 1),
  'ANIMALZ Summit 2025',
  'animalz-summit-2025',
  'O maior evento de tecnologia e inovação para gestão de eventos',
  'Descubra as melhores práticas, tendências e ferramentas para transformar seu evento em uma experiência inesquecível.',
  'ANIMALZ Summit 2025 é o evento definitivo para profissionais de gestão de eventos, produtores e empreendedores. Durante 3 dias intensos, você terá a oportunidade de aprender com os maiores especialistas da indústria, conhecer novas tecnologias e fazer networking com centenas de profissionais.',
  'Tech',
  'published',
  '2025-06-15 09:00:00',
  '2025-06-17 18:00:00',
  '2025-06-15 08:30:00',
  'São Paulo Convention Center',
  '{"street": "Av. Brig. Faria Lima, 1000", "city": "São Paulo", "state": "SP", "country": "Brazil", "zip": "01452-000"}',
  5000,
  0,
  '18',
  false,
  'both',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
  '{"video_url": null, "networking_enabled": true}'
);

-- Insert ticket types for the event
INSERT INTO ticket_types (
  event_id,
  name,
  description,
  color,
  sector,
  is_nominal,
  position,
  is_active
) VALUES (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  'Early Bird',
  'Ingresso com preço especial para os primeiros compradores',
  '#d4ff00',
  'Geral',
  false,
  1,
  true
), (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  'VIP Pass',
  'Acesso VIP com open bar e lounge premium',
  '#FF5A6B',
  'VIP',
  true,
  2,
  true
), (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  'Startup Pass',
  'Desconto especial para startups e empreendedores',
  '#00D9FF',
  'Geral',
  false,
  3,
  true
);

-- Insert ticket batches
INSERT INTO ticket_batches (
  event_id,
  ticket_type_id,
  name,
  price,
  quantity,
  sold_count,
  ends_at,
  position,
  is_active
) VALUES (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  (SELECT id FROM ticket_types WHERE event_id = (SELECT id FROM events WHERE slug = 'animalz-summit-2025') AND name = 'Early Bird' LIMIT 1),
  'Lote 1 - Early Bird',
  99.90,
  500,
  0,
  '2025-04-15 23:59:59',
  1,
  true
), (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  (SELECT id FROM ticket_types WHERE event_id = (SELECT id FROM events WHERE slug = 'animalz-summit-2025') AND name = 'Early Bird' LIMIT 1),
  'Lote 2 - Early Bird',
  149.90,
  1000,
  0,
  '2025-05-15 23:59:59',
  2,
  true
), (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  (SELECT id FROM ticket_types WHERE event_id = (SELECT id FROM events WHERE slug = 'animalz-summit-2025') AND name = 'VIP Pass' LIMIT 1),
  'VIP Pass',
  499.90,
  200,
  0,
  '2025-06-01 23:59:59',
  3,
  true
), (
  (SELECT id FROM events WHERE slug = 'animalz-summit-2025' LIMIT 1),
  (SELECT id FROM ticket_types WHERE event_id = (SELECT id FROM events WHERE slug = 'animalz-summit-2025') AND name = 'Startup Pass' LIMIT 1),
  'Startup Especial',
  49.90,
  300,
  0,
  '2025-05-30 23:59:59',
  4,
  true
);
