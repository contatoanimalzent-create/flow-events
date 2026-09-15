update public.events
set
  venue_name = 'Centro Urbano de Samambaia Sul',
  venue_address = '{"street":"Centro Urbano, Quadra 302, Conjunto 3","neighborhood":"Samambaia Sul","city":"Samambaia","state":"DF","country":"BR","reference":"Em frente à Igreja da Barca","latitude":-15.8812771,"longitude":-48.0815353,"maps_url":"https://www.google.com/maps/dir//-15.8812771,-48.0815353/@-15.8812771,-48.0841102,632m/data=!3m1!1e3!4m6!1m5!3m4!2zMTXCsDUyJzUyLjYiUyA0OMKwMDQnNTMuNSJX!8m2!3d-15.8812771!4d-48.0815353?hl=pt-BR&entry=ttu"}'::jsonb,
  updated_at = now()
where slug = 'bsb-fight-7';
