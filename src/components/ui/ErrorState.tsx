type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({ message = "Something went wrong.", onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-[16px] font-bold text-ink">{message}</p>
      <p className="mt-1.5 text-[13px] text-ink-muted">Please check your connection and try again.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-brand-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
