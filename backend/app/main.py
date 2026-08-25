from datetime import date
from decimal import Decimal
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import settings
from .db import SessionLocal
from .schemas import AnalyticsOut, BalanceOut, RedeemOut, RedeemRequest, RewardsOut, TransactionPage
from .services import analytics, get_balance, get_rewards, redeem, transaction_page

app = FastAPI(
    title="Digital Alpha Spend & Rewards API",
    version="1.0.0",
    description="Backend for the Digital Alpha Technologies take-home assignment.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/balance", response_model=BalanceOut)
def balance(db: DbSession):
    return get_balance(db)


@app.get("/api/rewards", response_model=RewardsOut)
def rewards(db: DbSession):
    coin_balance, items = get_rewards(db)
    return RewardsOut(coin_balance=coin_balance, rewards=items)


@app.get("/api/transactions", response_model=TransactionPage)
def transactions(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
    category: str | None = Query(None, max_length=80),
    status_filter: Literal["SUCCESS", "FAILED", "PENDING"] | None = Query(None, alias="status"),
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: Decimal | None = Query(None, ge=-999999999),
    max_amount: Decimal | None = Query(None, le=999999999),
    sort_by: Literal["date", "amount"] = "date",
    sort_order: Literal["asc", "desc"] = "desc",
):
    return transaction_page(
        db, page=page, page_size=page_size, search=search, category=category,
        status_filter=status_filter, start_date=start_date, end_date=end_date,
        min_amount=min_amount, max_amount=max_amount, sort_by=sort_by, sort_order=sort_order,
    )


@app.get("/api/analytics", response_model=AnalyticsOut)
def spending_analytics(
    db: DbSession,
    search: str | None = Query(None, max_length=100),
    category: str | None = Query(None, max_length=80),
    status_filter: Literal["SUCCESS", "FAILED", "PENDING"] | None = Query(None, alias="status"),
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: Decimal | None = Query(None, ge=-999999999),
    max_amount: Decimal | None = Query(None, le=999999999),
):
    return analytics(
        db, search=search, category=category, status_filter=status_filter,
        start_date=start_date, end_date=end_date, min_amount=min_amount, max_amount=max_amount,
    )


@app.post("/api/rewards/redeem", response_model=RedeemOut)
def redeem_reward(payload: RedeemRequest, db: DbSession):
    return redeem(db, payload.reward_id)
