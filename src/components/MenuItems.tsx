import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";

interface MenuItemsProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  addToCart: (id: number) => void;
}

const MenuItems = ({
  id,
  name,
  description,
  price,
  image,
  addToCart,
}: MenuItemsProps) => {
  return (
    <article className="surface-panel animate-fade-up overflow-hidden p-3 md:p-4 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(38,22,9,0.2)]">
      <div className="flex items-start gap-3 md:gap-4">
        <Image
          src={image}
          alt={`Imagem do prato ${name}`}
          width={112}
          height={112}
          className="h-24 w-24 rounded-xl object-cover ring-2 ring-white md:h-28 md:w-28"
        />

        <div className="flex-1">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.14em] font-extrabold text-[#9f6a49]">
            Destaque da cozinha
          </p>
          <h2 className="mt-0.5 text-lg md:text-xl font-extrabold text-zinc-900">
            {name}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl font-extrabold text-[#c63f10]">
              R$ {price.toFixed(2)}
            </p>
            <button
              onClick={() => addToCart(id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-500 px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-yellow-400"
              aria-label={`Adicionar ${name} ao carrinho`}
            >
              <IconPlus size={16} stroke={2} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MenuItems;
