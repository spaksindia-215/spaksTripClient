"use client";

import { useState, useEffect } from "react";
import type { TourDetail } from "@/lib/mock/tourPackages";

type Props = {
  pkg: TourDetail;
  initialCheckIn?: string;
  initialCheckOut?: string;
};

export default function BookingSidebar({ pkg, initialCheckIn, initialCheckOut }: Props) {
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? "");

  useEffect(() => {
    if (initialCheckIn !== undefined) setCheckIn(initialCheckIn);
  }, [initialCheckIn]);

  useEffect(() => {
    if (initialCheckOut !== undefined) setCheckOut(initialCheckOut);
  }, [initialCheckOut]);
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [tourTypeRoom, setTourTypeRoom] = useState("");
  const [room, setRoom] = useState("");
  const [flight, setFlight] = useState("");

  return (
    <div className="rounded-xl border border-border-soft bg-white shadow-md overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-5 border-b border-border-soft">
        <h2 className="text-[17px] font-bold text-[#2a7c6f]">{pkg.title}</h2>
        <p className="text-[13px] text-[#e07b2a] font-semibold mt-0.5">{pkg.duration}</p>
        <p className="text-[26px] font-extrabold text-[#1a5ba8] mt-2 leading-tight">
          Rs {pkg.price.toLocaleString("en-IN")}/-
        </p>
        <p className="text-[12px] text-ink-muted">Per Person</p>
      </div>

      {/* Package Cost Bar */}
      <div className="bg-[#1e3a5f] px-5 py-3">
        <p className="text-[13px] font-bold text-white tracking-wide">PACKAGE COST</p>
      </div>

      {/* Booking Form */}
      <div className="p-5 flex flex-col gap-4">
        {/* Tour Name */}
        <div>
          <input
            type="text"
            value={pkg.title}
            readOnly
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink bg-surface-muted cursor-default"
          />
        </div>

        {/* Check In / Check Out */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-ink-soft mb-1">Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded border border-border-soft px-3 py-2 text-[12px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink-soft mb-1">Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded border border-border-soft px-3 py-2 text-[12px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {/* Adults */}
        <div>
          <label className="block text-[12px] font-medium text-ink-soft mb-1">Adults</label>
          <input
            type="number"
            min={1}
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400"
            placeholder="Number of adults"
          />
        </div>

        {/* Children */}
        <div>
          <label className="block text-[12px] font-medium text-ink-soft mb-1">
            Children ( 2-12 Yrs )
          </label>
          <input
            type="number"
            min={0}
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400"
            placeholder="Number of children"
          />
        </div>

        {/* Tour Type Rooms */}
        <div>
          <label className="block text-[12px] font-medium text-ink-soft mb-1">
            Tour Type Rooms
          </label>
          <select
            value={tourTypeRoom}
            onChange={(e) => setTourTypeRoom(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
          >
            <option value="">--Select--</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Room */}
        <div>
          <label className="block text-[12px] font-medium text-ink-soft mb-1">Room</label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
          >
            <option value="">--Select--</option>
            <option value="single">Single Occupancy</option>
            <option value="double">Double Occupancy</option>
            <option value="triple">Triple Occupancy</option>
          </select>
        </div>

        {/* Flight */}
        <div>
          <label className="block text-[12px] font-medium text-ink-soft mb-1">Flight</label>
          <select
            value={flight}
            onChange={(e) => setFlight(e.target.value)}
            className="w-full rounded border border-border-soft px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
          >
            <option value="">--Select--</option>
            <option value="yes">With Flight</option>
            <option value="no">Without Flight</option>
          </select>
        </div>

        {/* Book Now */}
        <button
          type="button"
          className="w-full rounded-full bg-[#e53e2a] py-3 text-[15px] font-bold text-white hover:bg-[#c0392b] transition-colors mt-2"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
