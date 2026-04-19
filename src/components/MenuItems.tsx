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
    <div className="flex items-center space-x-4 p-4 border-b hover:bg-zinc-200 transition-colors duration-75">
      <Image
        src={image}
        alt={`Imagem do prato ${name}`}
        width={112}
        height={112}
        className="w-28 h-28 rounded-md hover:scale-110 hover:-rotate-2 transition-transform duration-300"
      />
      <div className="flex-1 cursor-pointer">
        <h2 className="font-bold text-zinc-800">{name}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-lg font-semibold text-red-400">
            R$ {price.toFixed(2)}
          </p>
          <button
            onClick={() => addToCart(id)}
            className="flex items-center gap-1 bg-green-300 rounded-md border border-zinc-300 px-2 py-1 text-sm text-black sm:w-[100px] sm:h-[30px]"
            aria-label={`Adicionar ${name} ao carrinho`}
          >
            <IconPlus size={16} stroke={2} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItems;
