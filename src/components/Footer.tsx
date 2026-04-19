import { IconHeartFilled } from "@tabler/icons-react";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-white/30 bg-gradient-to-r from-[#29160d] to-[#462614] px-5 py-6 overflow-x-hidden">
      <div className="section-shell flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <div>
          <p className="text-sm font-semibold text-amber-100">
            Altas Horas &copy; {new Date().getFullYear()} - Todos os direitos
            reservados
          </p>
          <p className="text-xs text-amber-200/80 mt-1">
            Cardapio digital com experiencia profissional para clientes e
            gestao.
          </p>
        </div>

        <p className="flex items-center gap-2 text-sm font-semibold text-amber-100">
          Desenvolvido com <IconHeartFilled size={16} color="#ff6b6b" /> por
          Lucas Macedo DEV
        </p>
      </div>
    </footer>
  );
};

export default Footer;
