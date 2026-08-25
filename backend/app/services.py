from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from math import ceil
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy import and_, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from .models import Redemption, Reward, Transaction, User
from .schemas import AnalyticsOut, BalanceOut, CategorySpend, MonthlySpend, RedeemOut, RewardOut, TransactionOut, TransactionPage

DEMO_USER_ID = 1


def reward_out(reward: Reward) -> RewardOut:
    return RewardOut(
        id=reward.id,
        name=reward.name,
        description=reward.description,
        coin_cost=reward.coin_cost,
        reward_type=reward.reward_type,
        value_inr=reward.value_inr,
        active=reward.active,
    )


def inclusive_date_bounds(start_date: date | None, end_date: date | None):
    lower = datetime.combine(start_date, time.min, tzinfo=timezone.utc) if start_date else None
    upper = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=timezone.utc) if end_date else None
    return lower, upper


def validate_filter_range(start_date: date | None, end_date: date | None, min_amount: Decimal | None, max_amount: Decimal | None):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must be on or before end_date")
    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(status_code=422, detail="min_amount must be less than or equal to max_amount")


def apply_transaction_filters(stmt, *, search, category, status_filter, start_date, end_date, min_amount, max_amount):
    conditions = []
    if search:
        conditions.append(func.lower(Transaction.merchant).like(f"%{search.strip().lower()}%"))
    if category:
        if category == "Uncategorised":
            conditions.append(or_(Transaction.category.is_(None), Transaction.category == ""))
        else:
            conditions.append(Transaction.category == category)
    if status_filter:
        conditions.append(func.upper(Transaction.status) == status_filter.upper())
    lower, upper = inclusive_date_bounds(start_date, end_date)
    if lower:
        conditions.append(Transaction.occurred_at >= lower)
    if upper:
        conditions.append(Transaction.occurred_at < upper)
    if min_amount is not None:
        conditions.append(Transaction.amount >= min_amount)
    if max_amount is not None:
        conditions.append(Transaction.amount <= max_amount)
    return stmt.where(and_(*conditions)) if conditions else stmt


def transaction_page(
    db: Session, *, page: int, page_size: int, search: str | None, category: str | None,
    status_filter: str | None, start_date: date | None, end_date: date | None,
    min_amount: Decimal | None, max_amount: Decimal | None,
    sort_by: Literal["date", "amount"], sort_order: Literal["asc", "desc"],
) -> TransactionPage:
    validate_filter_range(start_date, end_date, min_amount, max_amount)
    base = apply_transaction_filters(
        select(Transaction), search=search, category=category, status_filter=status_filter,
        start_date=start_date, end_date=end_date, min_amount=min_amount, max_amount=max_amount,
    )
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    sort_column = Transaction.occurred_at if sort_by == "date" else Transaction.amount
    primary = asc(sort_column) if sort_order == "asc" else desc(sort_column)
    items = db.scalars(base.order_by(primary, desc(Transaction.occurred_at), asc(Transaction.id)).offset((page - 1) * page_size).limit(page_size)).all()
    return TransactionPage(
        items=[TransactionOut.model_validate(item) for item in items],
        page=page, page_size=page_size, total=total,
        total_pages=ceil(total / page_size) if total else 0,
    )


def analytics(
    db: Session, *, search: str | None, category: str | None, status_filter: str | None,
    start_date: date | None, end_date: date | None, min_amount: Decimal | None, max_amount: Decimal | None,
) -> AnalyticsOut:
    validate_filter_range(start_date, end_date, min_amount, max_amount)
    base = apply_transaction_filters(
        select(Transaction), search=search, category=category, status_filter=status_filter,
        start_date=start_date, end_date=end_date, min_amount=min_amount, max_amount=max_amount,
    ).where(Transaction.status == "SUCCESS", Transaction.amount > 0).subquery()

    category_expr = func.coalesce(base.c.category, "Uncategorised")
    category_rows = db.execute(
        select(category_expr.label("category"), func.sum(base.c.amount).label("amount"), func.count().label("transaction_count"))
        .group_by(category_expr).order_by(func.sum(base.c.amount).desc())
    ).all()

    month_expr = func.to_char(func.date_trunc("month", base.c.occurred_at), "YYYY-MM")
    monthly_rows = db.execute(
        select(month_expr.label("month"), func.sum(base.c.amount).label("amount"), func.count().label("transaction_count"))
        .group_by(month_expr).order_by(month_expr.asc())
    ).all()

    return AnalyticsOut(
        category=[CategorySpend(category=row.category, amount=row.amount, transaction_count=row.transaction_count) for row in category_rows],
        monthly=[MonthlySpend(month=row.month, amount=row.amount, transaction_count=row.transaction_count) for row in monthly_rows],
    )


def get_balance(db: Session) -> BalanceOut:
    user = db.get(User, DEMO_USER_ID)
    if not user:
        raise HTTPException(status_code=503, detail="Demo user has not been seeded")
    return BalanceOut(coin_balance=user.coin_balance)


def get_rewards(db: Session):
    user = db.get(User, DEMO_USER_ID)
    if not user:
        raise HTTPException(status_code=503, detail="Demo user has not been seeded")
    rewards = db.scalars(select(Reward).where(Reward.active.is_(True)).order_by(Reward.coin_cost.asc())).all()
    return user.coin_balance, [reward_out(reward) for reward in rewards]


def redeem(db: Session, reward_id: str) -> RedeemOut:
    user = db.scalar(select(User).where(User.id == DEMO_USER_ID).with_for_update())
    if not user:
        raise HTTPException(status_code=503, detail="Demo user has not been seeded")
    reward = db.scalar(select(Reward).where(Reward.id == reward_id, Reward.active.is_(True)))
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    if user.coin_balance < reward.coin_cost:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"You need {reward.coin_cost:,} coins but have {user.coin_balance:,}")
    user.coin_balance -= reward.coin_cost
    db.add(Redemption(user_id=DEMO_USER_ID, reward_id=reward.id, coins_spent=reward.coin_cost, redeemed_at=datetime.now(timezone.utc)))
    db.commit()
    db.refresh(user)
    return RedeemOut(success=True, message=f"{reward.name} redeemed successfully.", coin_balance=user.coin_balance, reward=reward_out(reward))
