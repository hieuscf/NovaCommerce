export function HeroArt() {
  return (
    <div className="relative hidden h-[330px] w-[440px] shrink-0 lg:block" aria-hidden>
      <div
        className="absolute top-2 left-1/2 size-[290px] -translate-x-1/2 rounded-full border-2 border-white/85"
        style={{ boxShadow: '0 0 60px rgba(167,139,250,0.45), inset 0 0 40px rgba(255,255,255,0.6)' }}
      />
      <div
        className="absolute top-10 left-1/2 size-[230px] -translate-x-1/2 rounded-full blur-[2px]"
        style={{
          backgroundImage:
            'conic-gradient(from 200deg, rgba(96,165,250,0.55), rgba(167,139,250,0.55), rgba(244,114,182,0.4), rgba(96,165,250,0.55))',
          opacity: 0.55,
        }}
      />
      <div
        className="absolute top-[62px] left-[118px] h-[190px] w-[104px] rounded-[20px]"
        style={{
          backgroundImage: 'linear-gradient(150deg, #7e8794 0%, #4b535e 45%, #2b3138 100%)',
          boxShadow: '0 24px 40px -18px rgba(15,23,42,0.55)',
        }}
      >
        <div className="absolute top-3 left-3 grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="block size-[22px] rounded-full"
              style={{ backgroundImage: 'linear-gradient(160deg, #1e232a, #0b0e12)' }}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute top-[92px] right-[74px] size-[132px] rounded-full border-[22px] border-[#d8d2c7]"
        style={{ boxShadow: '0 22px 38px -16px rgba(15,23,42,0.4)' }}
      />
      <div
        className="absolute top-[150px] right-[58px] h-[74px] w-[58px] rounded-[26px]"
        style={{
          backgroundImage: 'linear-gradient(150deg, #efeae0 0%, #cfc7b8 100%)',
          boxShadow: '0 16px 26px -14px rgba(15,23,42,0.45)',
        }}
      />
      <div
        className="absolute top-[176px] left-[178px] h-[78px] w-[62px] rounded-2xl"
        style={{
          backgroundImage: 'linear-gradient(150deg, #2f353d 0%, #14181d 100%)',
          boxShadow: '0 18px 28px -14px rgba(15,23,42,0.5)',
        }}
      >
        <div
          className="absolute inset-[7px] rounded-[10px]"
          style={{ backgroundImage: 'linear-gradient(150deg, #3b2f6b 0%, #0f1730 100%)' }}
        />
      </div>
      <div
        className="absolute top-[214px] right-[26px] h-11 w-[52px] rounded-xl"
        style={{
          backgroundImage: 'linear-gradient(150deg, #ffffff 0%, #dfe3ea 100%)',
          boxShadow: '0 14px 22px -12px rgba(15,23,42,0.35)',
        }}
      />
      <div
        className="absolute bottom-[18px] left-1/2 h-[26px] w-[330px] -translate-x-1/2 rounded-[50%]"
        style={{
          backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #dbe2ef 100%)',
          boxShadow: '0 0 40px rgba(167,139,250,0.55)',
        }}
      />
      <div
        className="absolute bottom-1.5 left-1/2 h-[18px] w-[300px] -translate-x-1/2 rounded-[50%] bg-secondary/45 blur-[6px]"
      />
    </div>
  );
}
