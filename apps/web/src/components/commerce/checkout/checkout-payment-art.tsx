export function CheckoutPaymentArt() {
  return (
    <div className="pointer-events-none relative mt-5 overflow-hidden rounded-[28px] pt-[58%]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(165,180,252,0.55),transparent_42%),radial-gradient(circle_at_78%_30%,rgba(196,181,253,0.5),transparent_38%),linear-gradient(180deg,#eef2ff_0%,#f8f5ff_55%,#e8eeff_100%)]" />
      <div className="absolute right-[-10%] bottom-[-18%] size-[70%] rounded-full bg-[conic-gradient(from_200deg,#c4b5fd,#93c5fd,#a5b4fc,#c4b5fd)] opacity-70 blur-2xl" />

      <div className="absolute top-[18%] left-[12%] h-[42%] w-[46%] rotate-[-18deg] rounded-2xl bg-gradient-to-br from-[#7c8cff] to-[#4f46e5] shadow-[0_18px_40px_-18px_rgba(79,70,229,0.7)]">
        <div className="absolute top-3 left-3 size-4 rounded-sm bg-white/30" />
        <div className="absolute right-4 bottom-4 text-[10px] font-bold tracking-[0.2em] text-white/90">VISA</div>
      </div>
      <div className="absolute top-[28%] left-[28%] h-[40%] w-[44%] rotate-[12deg] rounded-2xl bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1] shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
        <div className="absolute top-3 left-3 size-4 rounded-sm bg-slate-400/40" />
        <div className="absolute right-4 bottom-4 text-[10px] font-bold tracking-[0.18em] text-slate-500">CARD</div>
      </div>

      <div className="absolute top-[22%] right-[18%] grid size-[38%] place-items-center">
        <div className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-indigo-200/80 to-violet-300/70 blur-[1px]" />
        <div
          className="relative grid size-[86%] place-items-center rounded-[28%] border border-white/70 bg-gradient-to-br from-white to-indigo-50 shadow-[0_16px_32px_-18px_rgba(79,70,229,0.55)]"
          style={{ clipPath: 'polygon(50% 6%, 92% 22%, 92% 58%, 50% 94%, 8% 58%, 8% 22%)' }}
        >
          <span className="grid size-10 place-items-center rounded-full bg-gradient-hero text-primary-foreground shadow-cta">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="7" y="11" width="10" height="8" rx="2" />
              <path d="M9 11V8a3 3 0 0 1 6 0v3" />
            </svg>
          </span>
        </div>
      </div>

      <div className="absolute bottom-[10%] left-[8%] h-8 w-16 rounded-[40%] bg-emerald-300/70" />
      <div className="absolute bottom-[8%] left-[18%] h-10 w-10 rounded-full bg-sky-300/60" />
      <div className="absolute right-[10%] bottom-[16%] size-8 rotate-12 rounded-lg bg-violet-300/80" />
      <div className="absolute right-[22%] bottom-[10%] size-6 rounded-full border-[3px] border-indigo-300/80" />
    </div>
  );
}
