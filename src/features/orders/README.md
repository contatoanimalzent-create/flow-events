## Orders

Domínio transacional responsável por pedidos, itens do pedido e emissão digital de ingressos.

Esta pasta concentra:
- modelagem de `orders`, `order_items` e `digital_tickets`
- fundação de checkout com draft, reserva, expiração e confirmação
- services e query layer para checkout real
- hooks de leitura e mutação do domínio
- componentes e modais operacionais de pedidos

Objetivo: servir como base escalável para checkout, pagamentos, emissão e pós-venda sem acoplar a regra transacional às páginas legadas.
