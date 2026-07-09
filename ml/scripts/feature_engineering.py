from __future__ import annotations

import pandas as pd


RIASEC_COLUMNS = [
    "realista",
    "investigativo",
    "artistico",
    "social",
    "emprendedor",
    "convencional",
]

BIGFIVE_CONTEXT_COLUMNS = [
    "apertura",
    "responsabilidad",
    "extraversion",
    "amabilidad",
    "neuroticismo",
    "tolerancia",
    "incertidumbreVocacional",
    "presionExterna",
]


def create_riasec_features(dataset: pd.DataFrame) -> pd.DataFrame:
    """Prepare RIASEC feature extraction for future training datasets."""
    return dataset.copy()


def create_bigfive_features(dataset: pd.DataFrame) -> pd.DataFrame:
    """Prepare Big Five and contextual feature extraction."""
    return dataset.copy()


def create_behavioral_features(dataset: pd.DataFrame) -> pd.DataFrame:
    """Prepare behavioral features from flow, uncertainty and semantic signals."""
    return dataset.copy()


def generate_training_features(dataset: pd.DataFrame) -> pd.DataFrame:
    """Build the future model-ready feature table."""
    features = create_riasec_features(dataset)
    features = create_bigfive_features(features)
    features = create_behavioral_features(features)

    return features
