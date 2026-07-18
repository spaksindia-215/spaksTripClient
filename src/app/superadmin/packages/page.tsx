"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { adminClient, type AdminPackage, type AdminPackageDetail, type AdminEnquiry, type PackageComparison } from "@/lib/adminClient";
import PackageTemplateModal, { TEMPLATE_KINDS } from "@/components/superadmin/PackageTemplateModal";
import { formatINR } from "@/lib/format";

type Tab = "templates" | "enquiries";

// Kinds the template modal can build/edit (everything except "bundle", which is
// composed through a different partner-only flow).
const EDITABLE_KINDS = new Set(TEMPLATE_KINDS.map((k) => k.value as string));

const STATUS_TONE: Record<string, "neutral" | "success" | "warn" | "danger"> = {
  active: "success", draft: "neutral", pending: "warn", paused: "warn", suspended: "danger",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Live" },
  { value: "pending", label: "Pending review" },
  { value: "suspended", label: "Suspended" },
];

const KIND_LABELS: Record<string, string> = Object.fromEntries([
  ...TEMPLATE_KINDS.map((k) => [k.value, k.label] as const),
  ["bundle", "Bundle"] as const,
]);

const FIELD_LABELS: Record<string, string> = {
  title: "Title", description: "Description", highlights: "Highlights",
  inclusions: "Inclusions", exclusions: "Exclusions", destinations: "Destinations",
  duration: "Duration", itinerary: "Itinerary", referencePrice: "Reference price",
};

function authorName(p: AdminPackage): string | null {
  if (p.origin !== "partner") return null;
  if (p.author && typeof p.author === "object") return p.author.companyName || p.author.name || "Partner";
  return "Partner";
}

// §5.3 — side-by-side review of a partner submission vs the closest platform
// template. Surfaces a duplicate warning so the reviewer rejects unmodified copies.
function CompareModal({
  pkg, onClose, onApprove, onReject,
}: {
  pkg: AdminPackage | null;
  onClose: () => void;
  onApprove: (p: AdminPackage) => void;
  onReject: (p: AdminPackage) => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<PackageComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!pkg) { setData(null); return; }
    setLoading(true);
    adminClient.packages
      .compare(pkg.id)
      .then(setData)
      .catch((e) => toast.push({ title: "Could not load comparison", description: e instanceof Error ? e.message : undefined, tone: "danger" }))
      .finally(() => setLoading(false));
  }, [pkg, toast]);

  const act = async (fn: (p: AdminPackage) => void) => {
    if (!pkg) return;
    setActing(true);
    try { fn(pkg); onClose(); } finally { setActing(false); }
  };

  return (
    <Modal open={!!pkg} onClose={onClose} title="Review partner submission" size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => act(onReject)} loading={acting} disabled={!pkg}>Reject (back to draft)</Button>
          <Button variant="accent" onClick={() => act(onApprove)} loading={acting} disabled={!pkg}>Approve &amp; publish</Button>
        </div>
      }>
      {loading && <div className="h-40 animate-pulse rounded-xl bg-border-soft/60" />}
      {!loading && data && (
        <div className="flex flex-col gap-3 p-1">
          {data.template ? (
            <div className={`rounded-lg border p-3 text-[13px] ${data.likelyDuplicate ? "border-red-300 bg-red-50 text-red-700" : "border-border-soft bg-surface-soft text-ink-soft"}`}>
              {data.likelyDuplicate
                ? `⚠ Likely duplicate — ${Math.round(data.similarity * 100)}% identical to template “${data.template.title}”. Reject unless the partner genuinely modified it.`
                : `${Math.round(data.similarity * 100)}% similar to the closest template “${data.template.title}”.`}
            </div>
          ) : (
            <div className="rounded-lg border border-border-soft bg-surface-soft p-3 text-[13px] text-ink-soft">
              No comparable platform template for this kind — this is an original partner package.
            </div>
          )}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-x-3 gap-y-1 text-[12px]">
            <div className="font-bold text-ink">Field</div>
            <div className="font-bold text-ink">Partner submission</div>
            <div className="font-bold text-ink">Closest template</div>
            {data.fields.map((f) => (
              <div key={f.field} className="contents">
                <div className="py-1.5 font-semibold text-ink-soft">{FIELD_LABELS[f.field] ?? f.field}</div>
                <div className={`py-1.5 wrap-break-word ${f.identical ? "text-red-600" : "text-ink"}`}>{f.partnerValue || <span className="text-ink-muted">—</span>}</div>
                <div className="py-1.5 wrap-break-word text-ink-muted">{f.templateValue || "—"}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-muted">Fields shown in red are identical to the template.</p>
        </div>
      )}
    </Modal>
  );
}

function PackageRow({
  p, busy, editing, onReview, onEdit, onSetStatus, onDelete,
}: {
  p: AdminPackage;
  busy: boolean;
  editing: boolean;
  onReview: (p: AdminPackage) => void;
  onEdit: (p: AdminPackage) => void;
  onSetStatus: (p: AdminPackage, status: string) => void;
  onDelete: (p: AdminPackage) => void;
}) {
  const img = p.thumbnail ?? p.images?.[0]?.url;
  const author = authorName(p);
  const duration = p.route.durationDays > 0 ? `${p.route.durationNights}N/${p.route.durationDays}D` : null;
  return (
    <article className="flex gap-4 rounded-xl border border-border-soft bg-white p-4 shadow-(--shadow-xs)">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={p.title} className="h-24 w-32 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[11px] text-ink-muted">No image</div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-ink">{p.title}</h3>
          <Badge tone={STATUS_TONE[p.status] ?? "neutral"} size="sm">{p.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{KIND_LABELS[p.kind] ?? p.kind}</span>
          <span className="capitalize">{p.scope}</span>
          {p.origin === "platform"
            ? <Badge tone="accent" size="sm">Curated</Badge>
            : <Badge tone="info" size="sm">by {author}</Badge>}
          {p.kind === "bundle" && p.components ? <span>· {p.components.length} component(s)</span> : null}
        </div>
        <p className="truncate text-[12px] text-ink-muted">
          {[duration, p.route.destinations.join(", ")].filter(Boolean).join(" · ") || "—"}
          {p.referencePrice ? ` · ref ${formatINR(p.referencePrice)}` : ""}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {p.origin === "partner" && p.status === "pending" && (
            <Button variant="accent" size="sm" onClick={() => onReview(p)}>Review</Button>
          )}
          {p.origin === "platform" && EDITABLE_KINDS.has(p.kind) && (
            <Button variant="secondary" size="sm" loading={editing} onClick={() => onEdit(p)}>Edit</Button>
          )}
          {p.status === "active" && (
            <Link href={`/packages/${p.slug}`} target="_blank" className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-muted">
              View live ↗
            </Link>
          )}
          {p.status !== "active" && <Button variant="ghost" size="sm" loading={busy} onClick={() => onSetStatus(p, "active")}>Activate</Button>}
          {p.status === "active" && <Button variant="ghost" size="sm" loading={busy} onClick={() => onSetStatus(p, "suspended")}>Suspend</Button>}
          <Button variant="danger" size="sm" loading={busy} onClick={() => onDelete(p)}>Delete</Button>
        </div>
      </div>
    </article>
  );
}

export default function AdminPackagesPage() {
  const toast = useToast();
  const [session, setSession] = useState<"checking" | "out" | "in">("checking");
  const [tab, setTab] = useState<Tab>("templates");
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kindFilter, setKindFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewPkg, setReviewPkg] = useState<AdminPackage | null>(null);
  const [editing, setEditing] = useState<AdminPackageDetail | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);

  useEffect(() => {
    adminClient.me().then(() => setSession("in")).catch(() => setSession("out"));
  }, []);

  // Honour a ?status= deep-link (e.g. from the Partner Listings "+ Add" flow).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("status");
    if (q !== null && STATUS_FILTERS.some((f) => f.value === q)) setStatusFilter(q);
  }, []);

  const refresh = useCallback(async () => {
    if (session !== "in") return;
    setLoading(true);
    try {
      if (tab === "templates") setPackages(await adminClient.packages.list({ status: statusFilter || undefined, kind: kindFilter || undefined }));
      else setEnquiries(await adminClient.packages.enquiries());
    } catch (e) {
      toast.push({ title: "Failed to load", description: e instanceof Error ? e.message : undefined, tone: "danger" });
    } finally { setLoading(false); }
  }, [tab, session, statusFilter, kindFilter, toast]);

  useEffect(() => { void refresh(); }, [refresh]);

  // A freshly created template is always "active"; make sure no filter hides it.
  // (An edit keeps its status, but a refresh is harmless either way.)
  const handleTemplateSaved = () => {
    if (statusFilter !== "" || kindFilter !== "") { setStatusFilter(""); setKindFilter(""); }
    else void refresh();
  };

  // Fetch the full record (list rows are trimmed) and open the modal in edit mode.
  const openEdit = async (p: AdminPackage) => {
    setEditLoadingId(p.id);
    try {
      setEditing(await adminClient.packages.get(p.id));
    } catch (e) {
      toast.push({ title: "Could not load listing", description: e instanceof Error ? e.message : undefined, tone: "danger" });
    } finally { setEditLoadingId(null); }
  };

  // Search is client-side over the loaded page (title, destinations, author).
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter((p) =>
      [p.title, p.route.destinations.join(" "), authorName(p) ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [packages, query]);

  if (session === "checking") return <div className="p-8 text-[14px] text-ink-muted">Checking session…</div>;
  if (session === "out") {
    return (
      <div className="p-8">
        <p className="text-[14px] text-ink-muted">You must sign in to the admin console first.</p>
        <Link href="/superadmin" className="text-[14px] font-semibold text-brand-600">Go to admin login →</Link>
      </div>
    );
  }

  const setStatus = async (p: AdminPackage, status: string) => {
    setBusyId(p.id);
    try {
      await adminClient.packages.setStatus(p.id, status);
      setPackages((prev) =>
        statusFilter && status !== statusFilter
          ? prev.filter((x) => x.id !== p.id) // fell out of the current filter view
          : prev.map((x) => (x.id === p.id ? { ...x, status: status as AdminPackage["status"] } : x)),
      );
      toast.push({ title: status === "active" ? "Published" : `Marked ${status}`, tone: "success" });
    } catch (e) { toast.push({ title: "Update failed", description: e instanceof Error ? e.message : undefined, tone: "danger" }); }
    finally { setBusyId(null); }
  };

  const deletePkg = async (p: AdminPackage) => {
    if (!window.confirm(`Delete “${p.title}” permanently?\n\nThis also removes every operator offer attached to it. This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await adminClient.packages.remove(p.id);
      setPackages((prev) => prev.filter((x) => x.id !== p.id));
      toast.push({ title: "Listing deleted", tone: "success" });
    } catch (e) { toast.push({ title: "Delete failed", description: e instanceof Error ? e.message : undefined, tone: "danger" }); }
    finally { setBusyId(null); }
  };

  const setEnquiryStatus = async (id: string, status: string) => {
    try { await adminClient.packages.updateEnquiry(id, { status }); setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: status as AdminEnquiry["status"] } : e))); }
    catch (e) { toast.push({ title: "Update failed", description: e instanceof Error ? e.message : undefined, tone: "danger" }); }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink">Marketplace Listings</h1>
          <p className="text-[13px] text-ink-muted">Curated &amp; partner packages shown to customers — partners attach their operating price as offers.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin" className="rounded-lg border border-border px-3 py-2 text-[13px] font-semibold text-ink-soft">← Admin</Link>
          {tab === "templates" && <Button variant="accent" onClick={() => setFormOpen(true)}>+ New Listing</Button>}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {([["templates", "Listings"], ["enquiries", "Enquiries"]] as [Tab, string][]).map(([k, label]) => (
          <Chip key={k} active={tab === k} onClick={() => setTab(k)}>{label}</Chip>
        ))}
      </div>

      {tab === "templates" && (
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border-soft bg-surface-muted/50 p-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Chip key={f.value || "all"} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>{f.label}</Chip>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-end gap-2">
            <Select label="" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} aria-label="Filter by type">
              <option value="">All types</option>
              {TEMPLATE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              <option value="bundle">Bundle</option>
            </Select>
            <Input label="" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, destination, partner…" aria-label="Search listings" className="min-w-56" />
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-border-soft/60" />)}
        </div>
      )}

      {!loading && tab === "templates" && (
        <div className="mt-5 grid gap-3">
          <p className="text-[12px] font-semibold text-ink-muted">{visible.length} listing{visible.length === 1 ? "" : "s"}</p>
          {visible.length === 0 ? (
            <EmptyState
              title="No listings in this view"
              subtitle={query ? "Try a different search or clear the filters." : "Create a listing — it goes live immediately and partners can price it from their dashboard."}
              cta={!query ? <Button variant="accent" onClick={() => setFormOpen(true)}>+ New Listing</Button> : undefined}
            />
          ) : visible.map((p) => (
            <PackageRow
              key={p.id}
              p={p}
              busy={busyId === p.id}
              editing={editLoadingId === p.id}
              onReview={setReviewPkg}
              onEdit={openEdit}
              onSetStatus={setStatus}
              onDelete={deletePkg}
            />
          ))}
        </div>
      )}

      {!loading && tab === "enquiries" && (
        <div className="mt-5 grid gap-3">
          {enquiries.length === 0 ? <EmptyState title="No enquiries yet" subtitle="Customer enquiries against operator offers appear here." /> : enquiries.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 rounded-xl border border-border-soft bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-bold text-ink">{typeof e.package === "object" ? e.package.title : "Package"}</p>
                <Badge tone={e.status === "new" ? "warn" : e.status === "converted" ? "success" : "neutral"} size="sm">{e.status}</Badge>
              </div>
              <p className="text-[13px] text-ink-soft">
                {e.contact.name} · {e.contact.phone}{e.contact.email ? ` · ${e.contact.email}` : ""}
                {" · operator: "}{typeof e.partner === "object" ? (e.partner.companyName || e.partner.name || "—") : "—"}
              </p>
              {e.message && <p className="text-[13px] text-ink-muted">“{e.message}”</p>}
              <div className="flex flex-wrap gap-2">
                {(["contacted", "converted", "closed", "spam"] as const).map((s) => (
                  <Button key={s} variant="ghost" size="sm" onClick={() => setEnquiryStatus(e.id, s)}>Mark {s}</Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PackageTemplateModal
        open={formOpen || !!editing}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={handleTemplateSaved}
      />
      <CompareModal
        pkg={reviewPkg}
        onClose={() => setReviewPkg(null)}
        onApprove={(p) => setStatus(p, "active")}
        onReject={(p) => setStatus(p, "draft")}
      />
    </div>
  );
}
