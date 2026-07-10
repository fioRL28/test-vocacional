from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "ml" / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"


def load_dataset(path: Path) -> pd.DataFrame:
    """Load a processed training dataset when real labeled data is ready."""
    return pd.read_csv(path)


def split_dataset(dataset: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Prepare train/test split logic without training models yet."""
    return dataset.copy(), dataset.iloc[0:0].copy()


def train_models(training_data: pd.DataFrame) -> dict[str, Any]:
    """Placeholder for future model training."""
    raise NotImplementedError("Model training is intentionally not implemented yet.")


def save_model(model: Any, path: Path) -> None:
    """Placeholder for future model artifact persistence."""
    raise NotImplementedError("Model persistence is intentionally not implemented yet.")


if __name__ == "__main__":
    print("ML training infrastructure is ready. Training is not implemented yet.")
