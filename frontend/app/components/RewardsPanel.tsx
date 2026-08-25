"use client";

import { useState } from "react";
import type { Reward } from "../types";
import { CheckIcon, SparkIcon } from "./Icons";

interface Props {
  balance: number;
  rewards: Reward[];
  redeeming: boolean;
  onRedeem: (reward: Reward) => Promise<void>;
}

export function RewardsPanel({ balance, rewards, redeeming, onRedeem }: Props) {
  const [selected, setSelected] = useState<Reward | null>(null);

  const confirm = async () => {
    if (!selected) return;
    await onRedeem(selected);
    setSelected(null);
  };

  return (
    <section className="rewards-section">
      <div className="rewards-intro">
        <div>
          <span className="eyebrow light">Rewards store</span>
          <h2>Turn everyday spend into something back.</h2>
          <p>Use your coins on simple cashback and voucher rewards.</p>
        </div>
        <div className="reward-balance-card"><span className="coin-orb large">✦</span><div><span>Available</span><strong>{balance.toLocaleString("en-IN")}</strong><small>coins</small></div></div>
      </div>
      <div className="reward-grid">
        {rewards.map((reward) => {
          const affordable = balance >= reward.coin_cost;
          return (
            <article key={reward.id} className={`reward-card ${affordable ? "" : "locked"}`}>
              <div className="reward-icon"><SparkIcon /></div>
              <div className="reward-type">{reward.reward_type}</div>
              <h3>{reward.name}</h3>
              <p>{reward.description}</p>
              <div className="reward-bottom"><strong>{reward.coin_cost.toLocaleString("en-IN")} <span>coins</span></strong><button type="button" disabled={!affordable} onClick={() => setSelected(reward)}>{affordable ? "Redeem" : "Locked"}</button></div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
            <div className="confirm-icon"><CheckIcon /></div>
            <span className="eyebrow">Confirm redemption</span>
            <h2 id="redeem-title">{selected.name}</h2>
            <p>Spend <strong>{selected.coin_cost.toLocaleString("en-IN")} coins</strong> to receive this reward.</p>
            <div className="confirm-balance"><span>Balance after redemption</span><strong>{(balance - selected.coin_cost).toLocaleString("en-IN")} coins</strong></div>
            <div className="modal-actions"><button type="button" className="button-secondary" disabled={redeeming} onClick={() => setSelected(null)}>Cancel</button><button type="button" className="button-primary" disabled={redeeming} onClick={confirm}>{redeeming ? "Redeeming…" : "Confirm & redeem"}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
