from __future__ import annotations

import math
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

COIN_CAP_PER_TRANSACTION = 50


def parse_timestamp(value: object) -> datetime:
    """Normalize supported source timestamp variants to an aware UTC datetime."""
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value) / 1000, tz=timezone.utc)

    raw = str(value).strip()
    if not raw:
        raise ValueError("timestamp cannot be empty")
    if len(raw) == 10 and raw[4] == "-" and raw[7] == "-":
        return datetime.fromisoformat(raw).replace(tzinfo=timezone.utc)
    if "/" in raw:
        return datetime.strptime(raw, "%d/%m/%Y %H:%M:%S").replace(tzinfo=timezone.utc)

    parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def parse_amount(value: object) -> Decimal:
    try:
        amount = Decimal(str(value)).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"invalid amount: {value!r}") from exc
    if not amount.is_finite():
        raise ValueError(f"invalid amount: {value!r}")
    return amount


def normalize_category(value: object) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def normalize_status(value: object) -> str:
    status = str(value).strip().upper()
    if status not in {"SUCCESS", "FAILED", "PENDING"}:
        raise ValueError(f"unsupported status: {value!r}")
    return status


def coins_for_payment(amount: Decimal, status: str) -> int:
    if status != "SUCCESS" or amount <= 0:
        return 0
    return min(math.floor(amount / Decimal("100")), COIN_CAP_PER_TRANSACTION)
