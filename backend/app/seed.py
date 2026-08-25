"""Idempotent PostgreSQL seed for the supplied Digital Alpha transaction data."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

from sqlalchemy import text

from . import db
from .models import Reward, Transaction, User

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "transactions.json"
SCHEMA_PATH = ROOT / "schema.sql"
DEMO_USER_ID = 1

REWARDS = [
    {
        "id": "cashback_100",
        "name": "₹100 Statement Cashback",
        "description": "Apply ₹100 cashback to your next card statement.",
        "coin_cost": 100,
        "reward_type": "cashback",
        "value_inr": Decimal("100.00"),
    },
    {
        "id": "food_250",
        "name": "₹250 Food Voucher",
        "description": "A demo voucher for your next dining order.",
        "coin_cost": 225,
        "reward_type": "voucher",
        "value_inr": Decimal("250.00"),
    },
    {
        "id": "shopping_250",
        "name": "₹250 Shopping Voucher",
        "description": "A demo voucher for an online shopping purchase.",
        "coin_cost": 225,
        "reward_type": "voucher",
        "value_inr": Decimal("250.00"),
    },
    {
        "id": "travel_500",
        "name": "₹500 Travel Voucher",
        "description": "A demo travel voucher for your next trip.",
        "coin_cost": 450,
        "reward_type": "voucher",
        "value_inr": Decimal("500.00"),
    },
    {
        "id": "cashback_1000",
        "name": "₹1,000 Statement Cashback",
        "description": "Apply ₹1,000 cashback to your next card statement.",
        "coin_cost": 850,
        "reward_type": "cashback",
        "value_inr": Decimal("1000.00"),
    },
]

from .normalization import coins_for_payment, normalize_category, normalize_status, parse_amount, parse_timestamp

def load_source() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, list):
        raise ValueError("transactions.json must contain a JSON array")
    return payload


def run_seed() -> int:
    source = load_source()
    normalized: list[dict] = []
    balance = 0

    for item in source:
        status = normalize_status(item["status"])
        amount = parse_amount(item["amount"])
        source_id = str(item["id"]).strip()
        merchant = str(item["merchant"]).strip()
        currency = str(item.get("currency", "INR")).strip().upper()
        payment_method = str(item["payment_method"]).strip()
        if not source_id or not merchant or not currency or not payment_method:
            raise ValueError(f"transaction {item.get('id')!r} has an empty required field")
        row = {
            "source_id": source_id,
            "occurred_at": parse_timestamp(item["timestamp"]),
            "merchant": merchant,
            "category": normalize_category(item.get("category")),
            "amount": amount,
            "currency": currency,
            "status": status,
            "payment_method": payment_method,
        }
        normalized.append(row)
        balance += coins_for_payment(amount, status)

    with db.engine.begin() as connection:
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
        for statement in schema_sql.split(";"):
            statement = statement.strip()
            if statement:
                connection.execute(text(statement))

    with db.SessionLocal() as session:
        # Reset only demo data. This makes the command safe to re-run locally.
        session.execute(text("DELETE FROM redemptions"))
        session.execute(text("DELETE FROM rewards"))
        session.execute(text("DELETE FROM transactions"))
        session.execute(text("DELETE FROM app_user"))
        session.commit()

        user = User(
            id=DEMO_USER_ID,
            display_name="Demo Cardholder",
            coin_balance=balance,
            created_at=datetime.now(timezone.utc),
        )
        session.add(user)
        session.add_all([Reward(**reward) for reward in REWARDS])
        session.flush()

        # Bulk insert through SQLAlchemy Core for predictable performance.
        session.execute(Transaction.__table__.insert(), normalized)
        session.commit()

    print(f"Seeded {len(normalized):,} transactions; starting balance: {balance:,} coins")
    return len(normalized)


if __name__ == "__main__":
    run_seed()
