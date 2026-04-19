import { DELIVERY_FEE, DELIVERY_TIME, OPERATING_HOURS } from "@/utils/config";
import { IconClock, IconMapPin, IconTruck } from "@tabler/icons-react";

export default function DeliveryBanner() {
  return (
    <div className="border border-yellow-500/26 bg-gradient-to-r from-yellow-500/10 to-yellow-300/5 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
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
        <div className="flex items-center gap-2 text-zinc-300">
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
        <div className="flex items-center gap-2 text-zinc-300">
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
