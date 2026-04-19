import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="relative overflow-hidden mb-8">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/banner6.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f130d]/85 via-[#5b2d11]/65 to-[#0f766e]/55" />

      <div className="relative section-shell pt-6 pb-9 md:pt-8 md:pb-12 animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-green-300 animate-soft-pulse" />
          Pedidos online ativos
        </div>

        <div className="mt-5 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/35 bg-white/20 p-2 backdrop-blur-sm shadow-2xl">
              <Image
                src="/Logoaltas.png"
                alt="Logo Altas Horas"
                width={110}
                height={110}
                className="h-[86px] w-[86px] rounded-xl object-cover md:h-[110px] md:w-[110px]"
              />
            </div>

            <div>
              <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl leading-none tracking-wider text-white drop-shadow-md">
                ALTAS HORAS
              </h1>
              <p className="mt-1 text-sm md:text-base font-semibold text-amber-100">
                Sabor rapido, atendimento profissional, pedido sem complicacao.
              </p>
            </div>
          </div>

          <div className="surface-panel bg-white/95 px-4 py-3 md:px-5 md:py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-zinc-500">
              Horario de funcionamento
            </p>
            <p className="mt-1 text-lg md:text-xl font-extrabold text-zinc-800">
              18:00 ate 02:00
            </p>
            <p className="text-sm text-zinc-600">Todos os dias</p>
            <Link
              href="/dono/pedidos"
              className="mt-2 inline-block rounded-lg bg-[#0f766e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a5f59]"
            >
              Area do dono
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
