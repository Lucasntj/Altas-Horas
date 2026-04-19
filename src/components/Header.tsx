import Image from "next/image";

const Header = () => {
  return (
    <header
      className="fixed z-40 top-0 left-0 right-0 p-4 text-center shadow-2xl"
      style={{
        backgroundImage: "url(/banner6.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "300px",
      }}
    >
      <div className="flex justify-around items-center text-center fixed z-40 left-0 right-0">
        <div>
          <Image
            src="/Logoaltas.png"
            alt="Logo"
            width={130}
            height={130}
            className="mx-auto w-[130px] h-[130px] rounded-full"
          />
          <h1 className="text-3xl font-bold text-zinc-100 ">ALTAS HORAS</h1>
          <p className="text-green-300 font-bold">Seu melhor pedido!</p>
          <div className="border-t py-1 pb-2">
            <h2 className="text-zinc-100"> Horário de funcionamento</h2>
            <span className="bg-zinc-600 py-1 px-2 rounded-full text-zinc-50">
              das 18:00 à 02:00
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
