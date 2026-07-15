"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { partnerClient, type HotelListingApi } from "@/lib/partnerClient";
import { partnerPackagesClient, type HolidayMatch } from "@/lib/partnerPackagesClient";

// Statuses a partner can push into the review queue from here.
const SUBMITTABLE = new Set(["draft", "paused", "suspended"]);

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function PartnerHotelsPage() {
  const toast = useToast();
  const [hotels, setHotels] = useState<HotelListingApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Holiday tie-up prompt: for each active hotel, active taxi packages that run in
  // the same city. Fetched proactively (not on click) so the prompt surfaces on its
  // own — that's the point of a "prompt".
  const [matches, setMatches] = useState<Record<string, HolidayMatch[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [tyingUp, setTyingUp] = useState<string | null>(null);
  const [tiedUp, setTiedUp] = useState<Set<string>>(new Set());
  const fetchedMatchesFor = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const items = await partnerClient.hotels.list();
        if (active) setHotels(items);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Unable to load your hotels.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const toFetch = hotels.filter((h) => h.status === "active" && !fetchedMatchesFor.current.has(h.id));
    if (toFetch.length === 0) return;
    toFetch.forEach((h) => {
      fetchedMatchesFor.current.add(h.id);
      partnerPackagesClient
        .holidayMatches(h.id)
        .then((res) => setMatches((prev) => ({ ...prev, [h.id]: res.items })))
        .catch(() => {
          // Silent — this is a passive discovery prompt, not a required action.
        });
    });
  }, [hotels]);

  const reload = () => setReloadKey((k) => k + 1);

  const toggleExpanded = (hotelId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(hotelId)) next.delete(hotelId);
      else next.add(hotelId);
      return next;
    });
  };

  const dismissMatches = (hotelId: string) => {
    setDismissed((prev) => new Set(prev).add(hotelId));
  };

  const tieUp = async (hotel: HotelListingApi, match: HolidayMatch) => {
    const key = `${hotel.id}:${match.id}`;
    setTyingUp(key);
    try {
      const item = await partnerPackagesClient.createHolidayTieUp(hotel.id, match.id);
      setTiedUp((prev) => new Set(prev).add(key));
      toast.push({
        title: "Holiday package created",
        description: `"${item.title}" — ${item.currency} ${item.referencePrice?.toLocaleString("en-IN") ?? "—"} total. Pending admin approval, same as your other listings.`,
        tone: "success",
      });
    } catch (err) {
      toast.push({
        title: "Could not create the holiday package",
        description: err instanceof ApiError ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setTyingUp(null);
    }
  };

  const submitForReview = async (hotel: HotelListingApi) => {
    setSubmitting(hotel.id);
    try {
      const updated = await partnerClient.hotels.submit(hotel.id);
      setHotels((prev) => prev.map((h) => (h.id === hotel.id ? { ...h, status: updated.status } : h)));
      toast.push({
        title: "Submitted for review",
        description: `${hotel.name} is now pending admin approval.`,
        tone: "success",
      });
    } catch (err) {
      toast.push({
        title: "Could not submit",
        description: err instanceof ApiError ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const deleteHotel = async (hotel: HotelListingApi) => {
    if (!window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    setDeleting(hotel.id);
    try {
      await partnerClient.hotels.remove(hotel.id);
      setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
      toast.push({ title: "Hotel deleted", tone: "success" });
    } catch (err) {
      toast.push({
        title: "Could not delete",
        description: err instanceof ApiError ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xxl font-semibold text-ink">My Hotels</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your listings, edit details, and submit drafts for approval.
          </p>
        </div>
        <Link href="/partner/hotels/new">
          <Button variant="accent" leading={<span aria-hidden>+</span>}>
            Add hotel
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md bg-surface-sunken" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : hotels.length === 0 ? (
        <EmptyState
          title="No hotels yet"
          subtitle="List your first property to start receiving enquiries."
          cta={
            <Link href="/partner/hotels/new">
              <Button variant="accent" size="sm">Add hotel</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {hotels.map((hotel) => {
            const hotelMatches = matches[hotel.id] ?? [];
            const showBanner = hotel.status === "active" && hotelMatches.length > 0 && !dismissed.has(hotel.id);
            return (
              <article key={hotel.id} className="flex flex-col gap-3 rounded-xl border border-border-soft bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{hotel.name}</span>
                      <StatusBadge status={hotel.status} />
                    </div>
                    <p className="text-[13px] text-ink-muted">
                      {hotel.address?.city || "—"} · {hotel.type} · updated {timeAgo(hotel.updatedAt)}
                    </p>
                    {hotel.status === "pending" && (
                      <p className="text-[12px] text-warn-600">Awaiting admin approval.</p>
                    )}
                    {hotel.status === "active" && (
                      <p className="text-[12px] text-success-600">Live and visible in search.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/partner/hotels/${hotel.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    {SUBMITTABLE.has(hotel.status) && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={submitting === hotel.id}
                        onClick={() => submitForReview(hotel)}
                      >
                        Submit for review
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === hotel.id}
                      onClick={() => deleteHotel(hotel)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {showBanner && (
                  <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-brand-800">
                        🎉 {hotelMatches.length} taxi package{hotelMatches.length === 1 ? "" : "s"} run{hotelMatches.length === 1 ? "s" : ""} in {hotel.address?.city} — turn &ldquo;{hotel.name}&rdquo; into a holiday package
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-[12px] font-semibold text-brand-700 hover:text-brand-800"
                          onClick={() => toggleExpanded(hotel.id)}
                        >
                          {expanded.has(hotel.id) ? "Hide matches" : "View matches ▾"}
                        </button>
                        <button
                          type="button"
                          className="text-[12px] text-ink-muted hover:text-ink-soft"
                          onClick={() => dismissMatches(hotel.id)}
                        >
                          Not now
                        </button>
                      </div>
                    </div>

                    {expanded.has(hotel.id) && (
                      <div className="mt-3 flex flex-col gap-2">
                        {hotelMatches.map((m) => {
                          const key = `${hotel.id}:${m.id}`;
                          const done = tiedUp.has(key);
                          return (
                            <div
                              key={m.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-soft bg-white p-3"
                            >
                              <div className="min-w-0">
                                <p className="text-[13px] font-bold text-ink">{m.title}</p>
                                <p className="text-[12px] text-ink-muted">
                                  {[m.route.origin, ...m.route.destinations].filter(Boolean).join(" → ")}
                                  {m.route.durationDays ? ` · ${m.route.durationDays}D/${m.route.durationNights}N` : ""}
                                  {m.fromPrice != null ? ` · from ${m.currency} ${m.fromPrice.toLocaleString("en-IN")}` : " · no operator price yet"}
                                </p>
                              </div>
                              <Button
                                variant={done ? "outline" : "accent"}
                                size="sm"
                                disabled={done || m.fromPrice == null}
                                loading={tyingUp === key}
                                onClick={() => tieUp(hotel, m)}
                              >
                                {done ? "✓ Tied up" : "Tie up"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
