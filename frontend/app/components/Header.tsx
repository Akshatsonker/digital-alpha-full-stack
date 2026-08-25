"use client";

import { SparkIcon } from "./Icons";

interface Props { balance: number; }

export function Header({ balance }: Props) {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <div className="brand-mark"><SparkIcon /></div>
        <div>
          <div className="brand-name">luma</div>
          <div className="brand-caption">spend smarter</div>
        </div>
      </div>
      <div className="account-pill" aria-label={`Reward balance ${balance.toLocaleString("en-IN")} coins`}>
        <span className="coin-orb">✦</span>
        <span><strong>{balance.toLocaleString("en-IN")}</strong> coins</span>
      </div>
    </header>
  );
}
