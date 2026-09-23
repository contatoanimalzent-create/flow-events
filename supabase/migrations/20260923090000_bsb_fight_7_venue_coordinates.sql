-- BSB FIGHT 7: grava as coordenadas do local em venue_coordinates.
--
-- A edge function staff-checkin le events.venue_coordinates para validar a cerca
-- do ponto. Esse campo estava nulo, entao a validacao de GPS era ignorada e o
-- ponto aceitaria registro de qualquer lugar.
--
-- Centro Urbano de Samambaia Sul, Quadra 302, Conjunto 9, Samambaia - DF
-- -15.877252578735352, -48.086490631103516
-- point armazena (x, y) = (longitude, latitude).

update public.events
set venue_coordinates = point(-48.086490631103516, -15.877252578735352)
where slug = 'bsb-fight-7'
  and venue_coordinates is null;
