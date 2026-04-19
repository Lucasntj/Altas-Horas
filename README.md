# Catalogo Altas Horas

Aplicacao Next.js para cardapio e fechamento de pedidos da lanchonete.

## Funcionalidades

- Cardapio com itens e carrinho
- Checkout com dados do cliente
- Registro de pedidos para operacao da lanchonete
- Area do dono com acompanhamento e atualizacao de status
- Filtros por status e busca por cliente/pedido/item
- Dashboard operacional (pedidos em andamento, faturamento do dia e ticket medio)

## Persistencia de pedidos

- Em producao, o sistema usa Postgres automaticamente quando `DATABASE_URL` estiver configurada.
- Em ambiente local sem banco, usa fallback em arquivo `.data/orders.json`.
- O backend suporta as duas formas sem mudar o frontend.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Variaveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

- `OWNER_PANEL_USER`: usuario de acesso da Area do Dono (padrao `dono`)
- `OWNER_PANEL_PASSWORD`: senha de acesso da Area do Dono
- `DATABASE_URL`: conexao Postgres para persistencia em producao
- `ORDERS_DATA_FILE` (opcional): caminho do arquivo local de pedidos

### Setup rapido para banco

1. Crie um banco Postgres (Supabase, Neon, Vercel Postgres, etc.).
2. Copie a string de conexao para `DATABASE_URL` no Vercel.
3. Faça redeploy.
4. O sistema cria a tabela `orders` automaticamente no primeiro uso.

## Deploy no Vercel

1. Conecte o repositorio no Vercel
2. Configure as variaveis de ambiente acima em Settings > Environment Variables
3. Faça deploy

## Fluxo de pedido

1. Cliente adiciona itens ao carrinho
2. Cliente informa nome, telefone e endereco
3. Sistema registra pedido como `novo`
4. Dono acompanha na rota `/dono/pedidos` e atualiza status

## Proximas integracoes

- Integracao com WhatsApp (fase futura)
- Integracao com pagamento online (fase futura)

## Area do dono protegida

- Rota: `/dono/pedidos`
- A listagem de pedidos (`GET /api/orders`) tambem eh protegida
- O cliente nao ve atalho no frontend publico
