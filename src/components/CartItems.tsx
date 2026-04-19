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
    <div className="bg-white rounded-xl border p-4 space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0"
        >
          <Image
            src={item.image}
            alt={`Imagem do prato ${item.name}`}
            width={96}
            height={96}
            className="w-24 h-24 rounded-md object-cover"
          />

          <div className="flex-1">
            <h3 className="font-semibold text-zinc-800">{item.name}</h3>
            <p className="text-sm text-zinc-600 line-clamp-2">
              {item.description}
            </p>
            <p className="text-red-500 font-bold mt-1">
              R$ {item.price.toFixed(2)}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onDecrease(item.id)}
                className="w-8 h-8 rounded-md border border-zinc-300 hover:bg-zinc-100"
                aria-label={`Diminuir quantidade de ${item.name}`}
              >
                -
              </button>
              <span className="min-w-6 text-center font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() => onIncrease(item.id)}
                className="w-8 h-8 rounded-md border border-zinc-300 hover:bg-zinc-100"
                aria-label={`Aumentar quantidade de ${item.name}`}
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="ml-2 text-sm text-red-500 hover:text-red-700 underline"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
