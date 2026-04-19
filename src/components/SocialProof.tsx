import { IconStar } from "@tabler/icons-react";

const reviews = [
  {
    id: 1,
    name: "Carlos M.",
    text: "Melhor smash burger da região! Chegou quentinho e dentro do prazo. Vou pedir toda semana!",
    rating: 5,
    time: "há 2 dias",
  },
  {
    id: 2,
    name: "Fernanda L.",
    text: "Onion rings crocantes demais e o milk shake de Ovomaltine é viciante. Site fácil de usar!",
    rating: 5,
    time: "há 5 dias",
  },
  {
    id: 3,
    name: "Rafael S.",
    text: "Pedi o Bacon Inferno e veio exatamente como descrito, bem recheado. Entrega rápida 👌",
    rating: 5,
    time: "há 1 semana",
  },
  {
    id: 4,
    name: "Juliana O.",
    text: "Cardápio montado pelo site é muito prático, gostei das fotos dos produtos. Lanche top!",
    rating: 5,
    time: "há 1 semana",
  },
];

export default function SocialProof() {
  return (
    <section className="py-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
            Avaliações
          </p>
          <h2 className="mt-0.5 text-2xl font-extrabold text-white">
            O que nossos clientes dizem
          </h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5">
          <IconStar
            size={16}
            fill="#eab308"
            className="text-yellow-400"
            stroke={0}
          />
          <span className="text-sm font-black text-yellow-400">5.0</span>
          <span className="text-xs text-zinc-500">
            ({reviews.length * 12}+)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-white/8 bg-zinc-900 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-300 text-sm font-black text-black">
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{review.name}</p>
                  <p className="text-xs text-zinc-500">{review.time}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={12}
                    fill="#eab308"
                    className="text-yellow-400"
                    stroke={0}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
