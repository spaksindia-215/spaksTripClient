"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/state/authStore";
import {
  agentClient,
  type AgentProfile,
  type AgentWalletLedger,
  type Booking,
  type BookingStatus,
  type ProductType,
} from "@/lib/agentClient";

const APEX_DOMAIN = process.env.NEXT_PUBLIC_APEX_DOMAIN ?? "spakstrip.com";

const PRODUCT_TYPES: ProductType[] = ["flight", "hotel", "taxi", "tour", "cruise", "package"];

const PRODUCT_LABELS: Record<ProductType, string> = {
  flight: "Flight",
  hotel: "Hotel",
  taxi: "Taxi",
  tour: "Tour",
  cruise: "Cruise",
  package: "Package",
};

const TABS: Array<{ value: BookingStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "held", label: "Held" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

function inr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Live mm:ss countdown to a hold's expiry.
function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return <span className="text-xs font-semibold text-danger-600">Expired</span>;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return (
    <span className="text-xs font-medium text-warn-600">
      Expires in {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

function earningsThisMonth(bookings: Booking[]): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return bookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((sum, b) => sum + (b.agentMarkup ?? 0), 0);
}

function earningsAllTime(bookings: Booking[]): number {
  return bookings.reduce((sum, b) => sum + (b.agentMarkup ?? 0), 0);
}

function bookingsThisMonth(bookings: Booking[]): number {
  const now = new Date();
  return bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

export default function AgentDashboardPage() {
  const toast = useToast();
  const displayName = useAuthStore((state) => state.user?.displayName ?? "");
  const firstName = displayName.trim().split(/\s+/)[0] || "there";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BookingStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const [ledger, setLedger] = useState<AgentWalletLedger | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<{
    productType: ProductType;
    amount: string;
    pnr: string;
    mode: "held" | "active";
    holdMinutes: string;
  }>({ productType: "flight", amount: "", pnr: "", mode: "held", holdMinutes: "30" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [items, prof] = await Promise.all([agentClient.bookings(), agentClient.profile()]);
        if (active) {
          setBookings(items);
          setProfile(prof);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Unable to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  // Wallet ledger — separate effect so paging doesn't refetch bookings/profile.
  useEffect(() => {
    let active = true;
    agentClient
      .walletLedger(ledgerPage, 10)
      .then((data) => {
        if (active) setLedger(data);
      })
      .catch(() => {
        // Non-fatal: dashboard still works without the ledger panel.
        if (active) setLedger(null);
      });
    return () => {
      active = false;
    };
  }, [ledgerPage, reloadKey]);

  const copySubdomain = (slug: string) => {
    const url = `https://${slug}.${APEX_DOMAIN}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        toast.push({ title: "Could not copy — please copy manually", tone: "warn" });
      });
  };

  const act = async (id: string, fn: () => Promise<Booking>) => {
    setBusyId(id);
    try {
      await fn();
      refresh();
    } catch (err) {
      toast.push({
        title: "Error",
        description: err instanceof ApiError ? err.message : "Action failed",
        tone: "danger",
      });
    } finally {
      setBusyId(null);
    }
  };

  const submitCreate = async () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.push({ title: "Enter a valid amount", tone: "warn" });
      return;
    }
    setCreating(true);
    try {
      await agentClient.create({
        productType: form.productType,
        amount,
        status: form.mode,
        pnr: form.pnr.trim() || undefined,
        holdMinutes: form.mode === "held" ? Number(form.holdMinutes) || 30 : undefined,
      });
      toast.push({ title: form.mode === "held" ? "Hold created" : "Booking created", tone: "success" });
      setCreateOpen(false);
      setForm({ productType: "flight", amount: "", pnr: "", mode: "held", holdMinutes: "30" });
      refresh();
    } catch (err) {
      toast.push({
        title: "Could not create",
        description: err instanceof ApiError ? err.message : "Failed",
        tone: "danger",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-9 w-64 animate-pulse rounded-md bg-surface-sunken" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-md bg-surface-sunken" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-md bg-surface-sunken" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-danger-200 bg-danger-50 p-4 text-[13px] text-danger-600">
        {error}
      </div>
    );
  }

  const visible = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" });

  const columns: Column<Booking>[] = [
    {
      key: "pnr",
      header: "PNR",
      cell: (b) => <span className="font-mono text-[13px] text-ink">{b.pnr ?? "—"}</span>,
    },
    {
      key: "product",
      header: "Product",
      cell: (b) => PRODUCT_LABELS[b.productType],
    },
    {
      key: "created",
      header: "Created",
      hideOnMobile: true,
      cell: (b) => <span className="text-ink-muted">{shortDate(b.createdAt)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (b) => (
        <span className="font-mono text-[13px]">
          {inr(b.amount)}
          {b.agentMarkup != null && b.agentMarkup > 0 ? (
            <span className="ml-2 text-brand-600">+{inr(b.agentMarkup)}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (b) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={b.status} />
          {b.status === "held" && b.holdExpiresAt ? <HoldCountdown expiresAt={b.holdExpiresAt} /> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          {b.status === "held" ? (
            <Button
              variant="primary"
              size="sm"
              loading={busyId === b.id}
              onClick={() => act(b.id, () => agentClient.confirm(b.id))}
            >
              Confirm
            </Button>
          ) : null}
          {b.status === "active" || b.status === "held" ? (
            <Button
              variant="outline"
              size="sm"
              loading={busyId === b.id}
              onClick={() => act(b.id, () => agentClient.cancel(b.id))}
            >
              {b.status === "held" ? "Release" : "Cancel"}
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xxl font-semibold text-ink">
            {greeting(new Date().getHours())}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Agent{profile?.name ? ` · ${profile.name}` : ""}</p>
        </div>
        <p className="text-sm text-ink-muted">{today}</p>
      </div>

      {/* Credit stats */}
      {profile ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Credit limit"
            value={profile.creditLimit != null ? inr(profile.creditLimit) : "—"}
          />
          <StatCard label="Used" value={inr(profile.creditUsed)} />
          <StatCard
            label="Available"
            value={profile.creditAvailable != null ? inr(profile.creditAvailable) : "—"}
          />
          <StatCard label="Wallet" value={inr(profile.walletBalance)} />
        </div>
      ) : null}

      {/* Earnings — inline secondary metrics */}
      <div className="rounded-md border border-border-soft bg-surface p-5 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Earnings</p>
        <p className="mt-2 text-sm text-ink">
          <span className="font-mono font-semibold">{inr(earningsThisMonth(bookings))}</span> this month
          {" · "}
          <span className="font-mono font-semibold">{inr(earningsAllTime(bookings))}</span> all-time
          {" · "}
          <span className="font-mono font-semibold">{bookingsThisMonth(bookings)}</span> bookings this month
        </p>
      </div>

      {/* Wallet ledger — settlement history (top-ups, booking debits, refunds) */}
      {ledger && ledger.items.length > 0 ? (
        <div className="rounded-md border border-border-soft bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Wallet history</p>
            <p className="text-[12px] text-ink-muted">
              {ledger.total} entr{ledger.total === 1 ? "y" : "ies"}
            </p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Note</th>
                  <th className="py-2 pr-4 text-right font-semibold">Amount</th>
                  <th className="py-2 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.items.map((e) => (
                  <tr key={e.id} className="border-t border-border-soft">
                    <td className="py-2 pr-4 whitespace-nowrap text-ink-soft">{shortDate(e.createdAt)}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                        {e.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-ink-muted">{e.note ?? (e.bookingId ? "Booking" : "—")}</td>
                    <td
                      className={`py-2 pr-4 text-right font-mono font-semibold ${
                        e.amount >= 0 ? "text-success-600" : "text-danger-600"
                      }`}
                    >
                      {e.amount >= 0 ? "+" : "−"}
                      {inr(Math.abs(e.amount))}
                    </td>
                    <td className="py-2 text-right font-mono text-ink">{inr(e.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ledger.total > ledger.pageSize ? (
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={ledger.page <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-[12px] text-ink-muted">
                Page {ledger.page} of {Math.max(1, Math.ceil(ledger.total / ledger.pageSize))}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={ledger.page >= Math.ceil(ledger.total / ledger.pageSize)}
                onClick={() => setLedgerPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Booking portal */}
      {profile ? (
        <div className="rounded-md border border-border-soft bg-surface p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your booking portal</p>
          {profile.slug ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-base font-medium text-ink break-all">
                {profile.slug}
                <span className="text-ink-muted">.{APEX_DOMAIN}</span>
              </p>
              <div className="flex gap-2">
                <a href={`https://${profile.slug}.${APEX_DOMAIN}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </a>
                <Button variant="outline" size="sm" onClick={() => copySubdomain(profile.slug!)}>
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-ink-muted">Subdomain pending…</p>
          )}
        </div>
      ) : null}

      {/* Bookings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onChange={(v) => setTab(v)} items={TABS} variant="segmented" />
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            New hold or booking
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(b) => b.id}
          empty={{
            title: "No bookings yet",
            subtitle: "Create a hold or booking to get started.",
          }}
        />
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New hold or booking"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={creating} onClick={submitCreate}>
              Create
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="bk-product" className="text-[13px] font-medium text-ink-soft">
              Product
            </label>
            <select
              id="bk-product"
              value={form.productType}
              onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value as ProductType }))}
              className="mt-1 h-11 w-full rounded-md border border-border bg-white px-3 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {PRODUCT_TYPES.map((p) => (
                <option key={p} value={p}>
                  {PRODUCT_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="bk-amount"
            label="Amount (₹)"
            type="number"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="0"
          />

          <Input
            id="bk-pnr"
            label="PNR (optional)"
            type="text"
            value={form.pnr}
            onChange={(e) => setForm((f) => ({ ...f, pnr: e.target.value }))}
            placeholder="e.g. ABC123"
          />

          <Tabs
            value={form.mode}
            onChange={(v) => setForm((f) => ({ ...f, mode: v }))}
            items={[
              { value: "held", label: "Hold" },
              { value: "active", label: "Confirmed booking" },
            ]}
            variant="segmented"
          />

          {form.mode === "held" ? (
            <Input
              id="bk-hold-minutes"
              label="Hold duration (minutes)"
              type="number"
              inputMode="numeric"
              value={form.holdMinutes}
              onChange={(e) => setForm((f) => ({ ...f, holdMinutes: e.target.value }))}
              placeholder="30"
              hint="Holds count against your credit limit until confirmed or released."
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
