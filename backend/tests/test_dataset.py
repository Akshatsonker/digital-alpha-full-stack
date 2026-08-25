import json
from collections import Counter
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "transactions.json"


def test_supplied_dataset_is_preserved_and_contains_all_10000_rows():
    rows = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    assert len(rows) == 10_000
    assert len({row["id"] for row in rows}) == 9_960
    assert sum(1 for row in rows if row.get("category") in (None, "")) == 200


def test_duplicate_source_ids_are_retained_as_distinct_records():
    rows = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    counts = Counter(row["id"] for row in rows)
    duplicated_ids = {source_id for source_id, count in counts.items() if count > 1}
    assert len(duplicated_ids) == 40
    assert sum(counts[source_id] for source_id in duplicated_ids) == 80
