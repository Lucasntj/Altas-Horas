import { IconHeartFilled } from "@tabler/icons-react";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-zinc-950 px-5 py-6 overflow-x-hidden">
      <div className="section-shell flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <div>
          <p className="text-sm font-semibold text-zinc-300">
            Altas Horas &copy; {new Date().getFullYear()} — Todos os direitos
            reservados
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Cardápio digital com experiência profissional para clientes e
            gestão.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Fotos dos produtos meramente ilustrativas.
          </p>
        </div>

        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
          Desenvolvido com <IconHeartFilled size={16} color="#f97316" /> por
          Lucas Macedo DEV
        </p>
      </div>
    </footer>
  );
};

export default Footer;
