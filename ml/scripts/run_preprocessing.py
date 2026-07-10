from __future__ import annotations

from export_raw_dataset import RAW_DATASET_PATH, export_raw_dataset
from preprocessing import (
    PROCESSED_DATASET_PATH,
    QUALITY_REPORT_PATH,
    preprocess_dataset,
)


def main() -> None:
    raw_dataset = export_raw_dataset(RAW_DATASET_PATH)
    clean_dataset = preprocess_dataset(
        raw_path=RAW_DATASET_PATH,
        processed_path=PROCESSED_DATASET_PATH,
        report_path=QUALITY_REPORT_PATH,
    )

    print("Preprocessing pipeline completed.")
    print(f"Raw rows exported: {len(raw_dataset)}")
    print(f"Clean rows saved: {len(clean_dataset)}")
    print(f"Raw dataset: {RAW_DATASET_PATH}")
    print(f"Processed dataset: {PROCESSED_DATASET_PATH}")
    print(f"Quality report: {QUALITY_REPORT_PATH}")


if __name__ == "__main__":
    main()
