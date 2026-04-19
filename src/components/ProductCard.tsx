import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Props {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard = ({ product, onAdd }: Props) => {
  return (
    <div className="bg-zinc-900 border border-yellow-500/25 rounded-2xl shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition duration-200">
      <Image
        src={product.image.trim()}
        alt={product.name}
        width={128}
        height={128}
        className="w-32 h-32 object-cover rounded-lg mb-4"
      />
      <h2 className="text-lg font-semibold text-center text-white">
        {product.name}
      </h2>
      <p className="text-zinc-400 text-sm text-center">{product.description}</p>
      <p className="text-yellow-400 font-bold text-base mt-2">
        R$ {product.price.toFixed(2)}
      </p>
      <button
        onClick={() => onAdd(product)}
        className="mt-3 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-medium transition"
      >
        + Adicionar
      </button>
    </div>
  );
};

export default ProductCard;
