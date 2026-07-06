"use client";

import type { Room } from "@/lib/mock/hotels";
import { formatINR } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const BED_LABELS: Record<string, string> = {
  king: "King Bed", queen: "Queen Bed", double: "Double Bed", twin: "Twin Beds", single: "Single Bed",
};

type Props = {
  room: Room;
  nights: number;
  rooms: number;
  onSelect: (room: Room) => void;
};

export default function RoomCard({ room, nights, rooms, onSelect }: Props) {
  const totalPrice = room.basePrice * nights * rooms;

  return (
    <article className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl border border-border-soft bg-white shadow-(--shadow-xs)">
      <div className="h-40 sm:h-auto sm:w-44 shrink-0 overflow-hidden bg-surface-muted">
        <img
          src={`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=70&sig=${room.id}`}
          alt={room.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-bold text-ink">{room.name}</h3>
            <p className="text-[12px] text-ink-muted mt-0.5">
              {BED_LABELS[room.bedType]} · {room.sizeSqm} m² · Up to {room.maxOccupancy} guests
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[20px] font-extrabold text-ink leading-tight">
              {formatINR(room.basePrice)}
              <span className="text-[12px] font-medium text-ink-muted"> /night</span>
            </p>
            <p className="text-[11px] text-ink-muted">
              {formatINR(totalPrice)} total · {nights}N · {rooms}R
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {room.breakfast && <Badge tone="success" size="sm">Breakfast included</Badge>}
          {room.refundable
            ? <Badge tone="success" size="sm">Free cancellation</Badge>
            : <Badge tone="warn" size="sm">Non-refundable</Badge>
          }
          <Badge tone="neutral" size="sm">{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</Badge>
          {room.seatsLeft <= 3 && (
            <Badge tone="danger" size="sm">Only {room.seatsLeft} left!</Badge>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 mt-auto pt-2 border-t border-border-soft">
          <p className="text-[12px] text-ink-muted">
            {room.amenities.slice(0, 3).map((a) => a.replace("_", " ")).join(" · ")}
          </p>
          <Button variant="accent" size="md" onClick={() => onSelect(room)}>
            Select Room
          </Button>
        </div>
      </div>
    </article>
  );
}
