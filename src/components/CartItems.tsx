import Image from "next/image";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartItemsProps {
  items: CartItem[];
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}

const CartItems = ({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemsProps) => {
  return (
    <div className="surface-panel p-4 md:p-5 space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="animate-fade-up flex gap-3 rounded-xl border border-[#ecd8c0] bg-[#fffdf9] p-3"
        >
          <Image
            src={item.image}
            alt={`Imagem do prato ${item.name}`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-xl object-cover"
          />

          <div className="flex-1">
            <h3 className="font-extrabold text-zinc-900">{item.name}</h3>
            <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
              {item.description}
            </p>
            <p className="text-[#c63f10] font-extrabold mt-2">
              R$ {item.price.toFixed(2)}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onDecrease(item.id)}
                className="h-8 w-8 rounded-lg border border-[#d3b99e] bg-white font-bold hover:bg-[#fff0df]"
                aria-label={`Diminuir quantidade de ${item.name}`}
              >
                -
              </button>
              <span className="min-w-7 text-center text-sm font-extrabold text-zinc-800">
                {item.quantity}
              </span>
              <button
                onClick={() => onIncrease(item.id)}
                className="h-8 w-8 rounded-lg border border-[#d3b99e] bg-white font-bold hover:bg-[#fff0df]"
                aria-label={`Aumentar quantidade de ${item.name}`}
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="ml-2 text-sm font-semibold text-[#c63f10] hover:text-[#9f2f08]"
              >
                Remover
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default CartItems;
