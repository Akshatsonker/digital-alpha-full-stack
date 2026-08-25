from decimal import Decimal

from app.normalization import coins_for_payment, normalize_category, normalize_status, parse_amount, parse_timestamp


def test_timestamp_parser_handles_all_source_shapes():
    assert parse_timestamp("2025-10-03").tzinfo is not None
    assert parse_timestamp("03/10/2025 21:03:27").year == 2025
    assert parse_timestamp("2025-10-03T21:03:27Z").year == 2025
    assert parse_timestamp(1768265109000).year == 2026


def test_seed_normalizes_messy_values():
    assert normalize_status("success") == "SUCCESS"
    assert normalize_category(None) is None
    assert normalize_category("   ") is None
    assert parse_amount("5065.00") == Decimal("5065.00")


def test_coin_rule_caps_and_ignores_refunds():
    assert coins_for_payment(Decimal("999999999"), "SUCCESS") == 50
    assert coins_for_payment(Decimal("999.99"), "SUCCESS") == 9
    assert coins_for_payment(Decimal("-500"), "SUCCESS") == 0
    assert coins_for_payment(Decimal("500"), "FAILED") == 0
