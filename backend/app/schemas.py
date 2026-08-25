from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_id: str
    occurred_at: datetime
    merchant: str
    category: str | None
    amount: Decimal
    currency: str
    status: str
    payment_method: str


class TransactionPage(BaseModel):
    items: list[TransactionOut]
    page: int
    page_size: int
    total: int
    total_pages: int


class CategorySpend(BaseModel):
    category: str
    amount: Decimal
    transaction_count: int


class MonthlySpend(BaseModel):
    month: str
    amount: Decimal
    transaction_count: int


class AnalyticsOut(BaseModel):
    category: list[CategorySpend]
    monthly: list[MonthlySpend]


class BalanceOut(BaseModel):
    coin_balance: int


class RewardOut(BaseModel):
    id: str
    name: str
    description: str
    coin_cost: int
    reward_type: str
    value_inr: Decimal
    active: bool


class RewardsOut(BaseModel):
    coin_balance: int
    rewards: list[RewardOut]


class RedeemRequest(BaseModel):
    reward_id: str = Field(min_length=1, max_length=50)


class RedeemOut(BaseModel):
    success: bool
    message: str
    coin_balance: int
    reward: RewardOut
