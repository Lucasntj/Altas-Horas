import { DELIVERY_FEE, DELIVERY_TIME, OPERATING_HOURS } from "@/utils/config";
import { IconClock, IconMapPin, IconTruck } from "@tabler/icons-react";

export default function DeliveryBanner() {
  return (
    <div className="rounded-2xl border border-yellow-500/26 bg-gradient-to-r from-yellow-500/10 to-yellow-300/5 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="grid grid-cols-1 gap-1.5 text-[14px] md:grid-cols-3 md:gap-3 md:text-sm">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-zinc-200">
          <IconClock
            size={16}
            className="text-yellow-400 shrink-0"
            stroke={2}
          />
          <span>
            <span className="font-bold text-white">{OPERATING_HOURS}</span>
            {" · "}Todos os dias
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-zinc-200">
          <IconTruck
            size={16}
            className="text-yellow-400 shrink-0"
            stroke={2}
          />
          <span>
            Entrega em{" "}
            <span className="font-bold text-white">{DELIVERY_TIME}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-zinc-200">
          <IconMapPin
            size={16}
            className="text-yellow-400 shrink-0"
            stroke={2}
          />
          <span>
            Taxa de entrega:{" "}
            <span className="font-bold text-white">
              R$ {DELIVERY_FEE.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
