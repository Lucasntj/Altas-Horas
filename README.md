# Catalogo Altas Horas

Aplicacao Next.js para cardapio e fechamento de pedidos da lanchonete.

## Funcionalidades

- Cardapio com itens e carrinho
- Checkout com dados do cliente
- Envio de pedido para o dono da lanchonete
- Envio de confirmacao para o WhatsApp do cliente

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Variaveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

- `WHATSAPP_OWNER_NUMBER`: numero do dono (com DDI, ex.: 5511999998888)
- `WHATSAPP_ACCESS_TOKEN`: token da API WhatsApp Cloud (Meta)
- `WHATSAPP_PHONE_NUMBER_ID`: Phone Number ID da conta WhatsApp Cloud
- `WHATSAPP_API_VERSION`: opcional (padrao `v21.0`)
- `OWNER_PANEL_USER`: usuario de acesso da Area do Dono (padrao `dono`)
- `OWNER_PANEL_PASSWORD`: senha de acesso da Area do Dono

### Sem API configurada

Se `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` nao estiverem definidos, o sistema ainda cria o pedido e retorna links `wa.me` para envio manual.

## Deploy no Vercel

1. Conecte o repositorio no Vercel
2. Configure as variaveis de ambiente acima em Settings > Environment Variables
3. Faça deploy

## Fluxo de pedido

1. Cliente adiciona itens ao carrinho
2. Cliente informa nome, WhatsApp e endereco
3. Sistema envia pedido para o dono
4. Sistema envia confirmacao para o WhatsApp do cliente

## Area do dono protegida

- Rota: `/dono/pedidos`
- A listagem de pedidos (`GET /api/orders`) tambem eh protegida
- O cliente nao ve atalho no frontend publico
