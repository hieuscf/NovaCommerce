export function SellerShopArt() {
  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[340px]" aria-hidden="true">
      <div
        className="absolute top-6 left-1/2 size-[236px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 42% 38%, rgba(219,234,254,0.98) 0%, rgba(224,231,255,0.88) 48%, rgba(237,233,254,0.4) 72%, transparent 78%)',
        }}
      />

      <div
        className="absolute top-12 right-10 grid size-11 place-items-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          boxShadow: '0 12px 22px -10px rgba(79,70,229,0.7)',
        }}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M7 17L17 7M17 7H9M17 7v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div
        className="absolute top-[72px] right-[58px] rounded-xl bg-white px-2.5 py-2"
        style={{ boxShadow: '0 14px 24px -16px rgba(79,70,229,0.5)' }}
      >
        <div className="mb-1.5 h-1 w-9 rounded-full bg-indigo-100" />
        <div className="flex h-7 items-end gap-1">
          <span className="w-1.5 rounded-sm bg-indigo-200" style={{ height: '38%' }} />
          <span className="w-1.5 rounded-sm bg-indigo-300" style={{ height: '58%' }} />
          <span className="w-1.5 rounded-sm bg-violet-400" style={{ height: '86%' }} />
          <span className="w-1.5 rounded-sm bg-indigo-400" style={{ height: '50%' }} />
        </div>
      </div>

      <div className="absolute bottom-[86px] left-[42px]">
        <span
          className="absolute -top-8 left-1 size-8 rounded-full"
          style={{ background: 'radial-gradient(circle, #4ade80, #16a34a)' }}
        />
        <span
          className="absolute -top-10 left-5 size-7 rounded-full"
          style={{ background: 'radial-gradient(circle, #86efac, #22c55e)' }}
        />
        <span
          className="block h-[72px] w-3 rounded-full"
          style={{ background: 'linear-gradient(180deg, #4ade80, #15803d)' }}
        />
      </div>

      <div
        className="absolute bottom-[78px] left-1/2 h-[118px] w-[150px] -translate-x-1/2 overflow-hidden rounded-[18px] rounded-t-[8px]"
        style={{
          background: 'linear-gradient(180deg, #f8fbff 0%, #dbe7ff 100%)',
          boxShadow: '0 26px 36px -22px rgba(37,99,235,0.55)',
        }}
      >
        <div
          className="h-[36px] w-full"
          style={{
            background:
              'repeating-linear-gradient(90deg, #2563eb 0 12px, #ffffff 12px 18px, #60a5fa 18px 28px, #ffffff 28px 34px)',
          }}
        />
        <div
          className="mx-auto mt-4 grid size-[50px] place-items-center rounded-[14px]"
          style={{ background: 'linear-gradient(160deg, #93c5fd, #3b82f6)' }}
        >
          <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="20" r="1.4" fill="currentColor" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            <path d="M4 5h2l2.2 9.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L21 8H8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div
        className="absolute bottom-[62px] left-[58px] h-[52px] w-[40px] rounded-[11px]"
        style={{ background: 'linear-gradient(160deg, #818cf8, #4f46e5)' }}
      >
        <span className="absolute top-1.5 left-1/2 h-2.5 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-200" />
      </div>
      <div
        className="absolute right-[52px] bottom-[58px] h-[58px] w-[44px] rounded-[12px]"
        style={{ background: 'linear-gradient(160deg, #a78bfa, #7c3aed)' }}
      >
        <span className="absolute top-2 left-1/2 h-3 w-5 -translate-x-1/2 rounded-full border-2 border-violet-200" />
      </div>

      <div
        className="absolute bottom-[54px] left-[118px] h-8 w-10 rounded-[3px]"
        style={{ background: 'linear-gradient(160deg, #fbbf24, #d97706)' }}
      />
      <div
        className="absolute bottom-[50px] left-[132px] h-6 w-8 rounded-[3px]"
        style={{ background: 'linear-gradient(160deg, #fdba74, #ea580c)' }}
      />
    </div>
  );
}
