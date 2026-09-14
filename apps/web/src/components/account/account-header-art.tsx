export function AccountHeaderArt() {
  return (
    <div
      className="nova-account-art pointer-events-none absolute top-0 right-2 -z-0 hidden h-[164px] w-[470px] overflow-hidden lg:block"
      aria-hidden="true"
    >
      <div
        className="absolute top-[-40px] right-[30px] size-[230px] rounded-full opacity-55"
        style={{
          backgroundImage:
            'conic-gradient(from 210deg, rgb(165 180 252 / 0.8), rgb(196 181 253 / 0.8), rgb(191 219 254 / 0.7), rgb(165 180 252 / 0.8))',
        }}
      />
      <div
        className="absolute bottom-[10px] left-[10px] h-[110px] w-[70px] rounded-[45%_55%_50%_50%] opacity-65"
        style={{ backgroundImage: 'linear-gradient(170deg, #93c5fd, #6366f1)' }}
      />
      <div className="absolute bottom-[6px] left-[82px]">
        <div
          className="h-[86px] w-[112px] rounded-t-[8px] p-[5px]"
          style={{ backgroundImage: 'linear-gradient(160deg, #9aa1ab, #3b424b)' }}
        >
          <div
            className="h-full w-full rounded-[4px]"
            style={{ backgroundImage: 'linear-gradient(160deg, #1e293b, #0b1226)' }}
          />
        </div>
        <div
          className="ml-[-10px] h-[7px] w-[132px] rounded-b-[6px]"
          style={{ backgroundImage: 'linear-gradient(180deg, #cbd2da, #5b6371)' }}
        />
      </div>
      <div
        className="absolute bottom-[26px] left-[196px] size-[86px] rounded-full"
        style={{ border: '16px solid #ded8cc' }}
      />
      <div
        className="absolute bottom-[16px] left-[214px] h-[54px] w-[42px] rounded-[18px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #f2ede3, #cdc5b6)' }}
      />
      <div
        className="absolute bottom-[14px] left-[292px] h-[64px] w-[50px] rounded-[14px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #333a42, #10141a)' }}
      >
        <div
          className="absolute inset-[5px] rounded-[10px]"
          style={{ backgroundImage: 'linear-gradient(150deg, #5b3fa8, #0b1026)' }}
        />
      </div>
      <div
        className="absolute bottom-[18px] left-[352px] h-[118px] w-[66px] rounded-[14px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #8a929d, #262b32)' }}
      >
        <div className="absolute top-2 left-2 grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="block size-[13px] rounded-full bg-[#12161b]" />
          ))}
        </div>
      </div>
      <div
        className="absolute bottom-[16px] left-[436px] h-[44px] w-[50px] rounded-[14px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #ffffff, #dfe4ec)' }}
      />
    </div>
  );
}
