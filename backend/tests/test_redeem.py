"""Integration tests for the redeem contract.

Set TEST_DATABASE_URL to a disposable PostgreSQL database before running these tests.
They are skipped when PostgreSQL is not available, so a fresh clone can still run the
unit tests without a local database.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

pytestmark = pytest.mark.integration


def _client_or_skip():
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("TEST_DATABASE_URL is not configured")
    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - environment dependent
        pytest.skip(f"PostgreSQL unavailable: {exc}")

    from app import config, db, main
    from app.seed import run_seed

    config.settings.database_url = url
    db.engine.dispose()
    db.engine = create_engine(url, pool_pre_ping=True)
    db.SessionLocal.configure(bind=db.engine)
    run_seed()
    return TestClient(main.app)


def test_redeem_success_decrements_balance():
    client = _client_or_skip()
    before = client.get("/api/balance").json()["coin_balance"]
    reward = client.get("/api/rewards").json()["rewards"][0]
    response = client.post("/api/rewards/redeem", json={"reward_id": reward["id"]})
    assert response.status_code == 200
    assert response.json()["coin_balance"] == before - reward["coin_cost"]


def test_redeem_unknown_reward_is_404():
    client = _client_or_skip()
    response = client.post("/api/rewards/redeem", json={"reward_id": "does-not-exist"})
    assert response.status_code == 404


def test_redeem_insufficient_balance_is_409_without_mutation():
    client = _client_or_skip()
    from app import db

    with db.engine.begin() as connection:
        connection.execute(text("UPDATE app_user SET coin_balance = 0 WHERE id = 1"))

    reward = client.get("/api/rewards").json()["rewards"][0]
    response = client.post("/api/rewards/redeem", json={"reward_id": reward["id"]})
    assert response.status_code == 409
    assert client.get("/api/balance").json()["coin_balance"] == 0
