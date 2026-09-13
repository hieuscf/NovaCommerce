export function LoginPodiumArt() {
  return (
    <div className="relative mx-auto h-[420px] w-[600px] max-w-full" aria-hidden="true">
      <div
        className="absolute top-[40px] left-[150px] size-[250px] rounded-full blur-[1px]"
        style={{
          background:
            'conic-gradient(from 210deg, rgba(147,197,253,0.85), rgba(196,181,253,0.85), rgba(251,207,232,0.7), rgba(147,197,253,0.85))',
          opacity: 0.75,
        }}
      />
      <div
        className="absolute top-[8px] left-[92px] h-[330px] w-[370px] rounded-t-full"
        style={{
          border: '3px solid rgba(255,255,255,0.9)',
          borderBottom: 'none',
          boxShadow: '0 0 50px rgba(196,181,253,0.6)',
        }}
      />
      <div
        className="absolute bottom-[70px] left-[8px] h-[120px] w-[92px] rounded-[40%_60%_50%_50%]"
        style={{
          background: 'linear-gradient(160deg, #a5b4fc 0%, #7c8bd9 60%, #5b6bb5 100%)',
          opacity: 0.75,
        }}
      />
      <div
        className="absolute right-[10px] bottom-[78px] h-[132px] w-[104px] rounded-[55%_45%_50%_50%]"
        style={{
          background: 'linear-gradient(200deg, #c7d2fe 0%, #8b96d8 60%, #6472b8 100%)',
          opacity: 0.75,
        }}
      />
      <div
        className="absolute bottom-[104px] left-[132px] h-[210px] w-[112px] rounded-[22px]"
        style={{
          background: 'linear-gradient(150deg, #8a929d 0%, #4c545f 42%, #262b32 100%)',
          boxShadow: '0 28px 44px -20px rgba(15,23,42,0.6)',
        }}
      >
        <div className="absolute top-3 left-3 grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="block size-[23px] rounded-full"
              style={{ background: 'linear-gradient(160deg,#232931,#0a0d11)' }}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute bottom-[92px] left-[196px] h-[92px] w-[74px] rounded-[18px]"
        style={{
          background: 'linear-gradient(150deg, #333a42 0%, #10141a 100%)',
          boxShadow: '0 20px 30px -16px rgba(15,23,42,0.55)',
        }}
      >
        <div
          className="absolute inset-[7px] rounded-[12px]"
          style={{ background: 'linear-gradient(150deg,#5b3fa8 0%,#1b2450 60%,#0b1026 100%)' }}
        />
      </div>
      <div
        className="absolute bottom-[124px] left-[248px] size-[132px] rounded-full"
        style={{
          border: '24px solid #ddd7cb',
          boxShadow: '0 24px 36px -20px rgba(15,23,42,0.45)',
        }}
      />
      <div
        className="absolute bottom-[100px] left-[280px] h-[82px] w-[62px] rounded-[28px]"
        style={{
          background: 'linear-gradient(150deg, #f2ede3 0%, #cdc5b6 100%)',
          boxShadow: '0 18px 26px -16px rgba(15,23,42,0.45)',
        }}
      />
      <div className="absolute bottom-[96px] left-[398px]">
        <div
          className="h-[140px] w-[176px] rounded-t-[10px] p-[6px]"
          style={{ background: 'linear-gradient(160deg, #9aa1ab 0%, #3b424b 100%)' }}
        >
          <div
            className="h-full w-full rounded-[5px]"
            style={{
              background:
                'conic-gradient(from 150deg at 45% 62%, #22d3ee, #6366f1, #4338ca, #a855f7, #22d3ee)',
            }}
          />
        </div>
        <div
          className="ml-[-14px] h-[10px] w-[204px] rounded-b-[8px]"
          style={{ background: 'linear-gradient(180deg,#cbd2da,#5b6371)' }}
        />
      </div>
      <div
        className="absolute right-[34px] bottom-[90px] h-[56px] w-[62px] rounded-[16px]"
        style={{
          background: 'linear-gradient(150deg,#ffffff 0%,#dfe4ec 100%)',
          boxShadow: '0 16px 24px -14px rgba(15,23,42,0.4)',
        }}
      />
      <div
        className="absolute bottom-[46px] left-1/2 h-[52px] w-[430px] -translate-x-1/2 rounded-[50%]"
        style={{
          background: 'linear-gradient(180deg,#ffffff 0%,#e7ecf6 55%,#cdd6e6 100%)',
          boxShadow: '0 26px 50px -20px rgba(79,70,229,0.45)',
        }}
      />
      <div
        className="absolute bottom-[34px] left-1/2 h-[26px] w-[400px] -translate-x-1/2 rounded-[50%] blur-[8px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(236,72,153,0.55), rgba(139,92,246,0.7), rgba(59,130,246,0.55))',
        }}
      />
      <div
        className="absolute bottom-[10px] left-1/2 h-[30px] w-[470px] -translate-x-1/2 rounded-[50%] blur-[14px]"
        style={{ background: 'rgba(255,255,255,0.85)' }}
      />
    </div>
  );
}
