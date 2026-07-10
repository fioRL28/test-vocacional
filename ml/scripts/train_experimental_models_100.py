from __future__ import annotations

import pickle
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_experimental_100_dataset.csv"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs"
METRICS_PATH = OUTPUTS_DIR / "experimental_model_metrics_100.csv"
CONFUSION_MATRIX_PATH = OUTPUTS_DIR / "confusion_matrix_100.csv"
REPORT_PATH = OUTPUTS_DIR / "training_experiment_report_100.txt"

RANDOM_STATE = 42
TEST_SIZE = 0.25

TARGET_COLUMN = "main_profile_code"
TARGET_FALLBACK_COLUMN = "final_profile_code"

FEATURE_COLUMNS = [
    "riasec_realista",
    "riasec_investigativo",
    "riasec_artistico",
    "riasec_social",
    "riasec_emprendedor",
    "riasec_convencional",
    "big_five_apertura",
    "big_five_responsabilidad",
    "big_five_extraversion",
    "big_five_amabilidad",
    "big_five_neuroticismo",
    "incertidumbre_vocacional",
    "presion_externa",
    "tolerancia_dificultad",
    "likert_answer_count",
    "open_answer_count",
]


def load_training_dataset(path: Path = DATASET_PATH) -> pd.DataFrame:
    dataset = pd.read_csv(path)

    if TARGET_COLUMN not in dataset.columns:
        if TARGET_FALLBACK_COLUMN not in dataset.columns:
            raise ValueError(
                f"Target column '{TARGET_COLUMN}' not found and fallback "
                f"'{TARGET_FALLBACK_COLUMN}' is unavailable."
            )
        dataset[TARGET_COLUMN] = dataset[TARGET_FALLBACK_COLUMN]

    missing_features = [column for column in FEATURE_COLUMNS if column not in dataset.columns]
    if missing_features:
        raise ValueError(f"Missing feature columns: {missing_features}")

    return dataset


def build_models() -> dict[str, object]:
    return {
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "svm": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                (
                    "model",
                    SVC(
                        kernel="rbf",
                        C=3.0,
                        gamma="scale",
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
        "knn": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                ("model", KNeighborsClassifier(n_neighbors=5, weights="distance")),
            ]
        ),
        "decision_tree": DecisionTreeClassifier(
            max_depth=6,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "logistic_regression": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                (
                    "model",
                    LogisticRegression(
                        max_iter=2000,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
    }


def evaluate_predictions(
    model_name: str,
    y_true: pd.Series,
    y_pred: pd.Series,
    labels: list[str],
) -> tuple[dict[str, float | str], pd.DataFrame]:
    metrics = {
        "model": model_name,
        "accuracy": accuracy_score(y_true, y_pred),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_true, y_pred, average="macro", zero_division=0),
    }
    matrix = confusion_matrix(y_true, y_pred, labels=labels)
    matrix_rows = []

    for true_index, true_label in enumerate(labels):
        for predicted_index, predicted_label in enumerate(labels):
            matrix_rows.append(
                {
                    "model": model_name,
                    "true_label": true_label,
                    "predicted_label": predicted_label,
                    "count": int(matrix[true_index, predicted_index]),
                }
            )

    return metrics, pd.DataFrame(matrix_rows)


def save_model(model_name: str, model: object, labels: list[str]) -> Path:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / f"{model_name}_experimental_100.pkl"
    artifact = {
        "model_name": model_name,
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "labels": labels,
        "dataset_path": str(DATASET_PATH),
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
    }

    with model_path.open("wb") as file:
        pickle.dump(artifact, file)

    return model_path


def write_report(
    dataset: pd.DataFrame,
    train_data: pd.DataFrame,
    test_data: pd.DataFrame,
    metrics: pd.DataFrame,
    model_paths: dict[str, Path],
) -> None:
    real_count = int((dataset.get("is_synthetic", False) == False).sum())
    synthetic_count = int((dataset.get("is_synthetic", False) == True).sum())
    synthetic_percentage = synthetic_count / max(1, len(dataset))
    distribution = dataset[TARGET_COLUMN].value_counts().sort_index()

    lines = [
        "Reporte de entrenamiento experimental - Dataset 100",
        "=" * 62,
        f"Dataset: {DATASET_PATH}",
        f"Target solicitado: {TARGET_COLUMN}",
        f"Target usado: {TARGET_COLUMN} (derivado de {TARGET_FALLBACK_COLUMN})",
        f"Features numericas: {len(FEATURE_COLUMNS)}",
        f"Registros totales: {len(dataset)}",
        f"Registros reales: {real_count}",
        f"Registros sinteticos: {synthetic_count} ({synthetic_percentage:.1%})",
        f"Train/Test split: {len(train_data)}/{len(test_data)} estratificado",
        "",
        "Distribucion por perfil:",
    ]
    lines.extend(f"- {label}: {count}" for label, count in distribution.items())

    lines.extend(["", "Metricas por modelo:"])
    for row in metrics.sort_values("f1_macro", ascending=False).itertuples(index=False):
        lines.append(
            "- "
            f"{row.model}: accuracy={row.accuracy:.4f}, "
            f"precision_macro={row.precision_macro:.4f}, "
            f"recall_macro={row.recall_macro:.4f}, "
            f"f1_macro={row.f1_macro:.4f}"
        )

    lines.extend(["", "Modelos guardados:"])
    lines.extend(f"- {model_name}: {path}" for model_name, path in model_paths.items())

    lines.extend(
        [
            "",
            "Advertencias:",
            "- Este entrenamiento es experimental porque 51.0% del dataset es sintetico.",
            "- Las metricas pueden verse optimistas por patrones sinteticos y por el tamano reducido del dataset.",
            "- Los datos sinteticos no reemplazan datos reales; conviene recalibrar con nuevas respuestas observadas antes de uso productivo.",
            "- No se modifico UI, scoring, Prisma ni logica actual del test.",
        ]
    )

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_training() -> None:
    dataset = load_training_dataset()
    labels = sorted(dataset[TARGET_COLUMN].unique().tolist())
    train_data, test_data = train_test_split(
        dataset,
        test_size=TEST_SIZE,
        stratify=dataset[TARGET_COLUMN],
        random_state=RANDOM_STATE,
    )

    x_train = train_data[FEATURE_COLUMNS]
    y_train = train_data[TARGET_COLUMN]
    x_test = test_data[FEATURE_COLUMNS]
    y_test = test_data[TARGET_COLUMN]

    metric_rows = []
    confusion_rows = []
    model_paths: dict[str, Path] = {}

    for model_name, model in build_models().items():
        model.fit(x_train, y_train)
        y_pred = pd.Series(model.predict(x_test), index=y_test.index)
        metrics, matrix = evaluate_predictions(model_name, y_test, y_pred, labels)
        metric_rows.append(metrics)
        confusion_rows.append(matrix)
        model_paths[model_name] = save_model(model_name, model, labels)

    metrics_dataset = pd.DataFrame(metric_rows).sort_values("model").reset_index(drop=True)
    confusion_dataset = pd.concat(confusion_rows, ignore_index=True)

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    metrics_dataset.to_csv(METRICS_PATH, index=False, encoding="utf-8")
    confusion_dataset.to_csv(CONFUSION_MATRIX_PATH, index=False, encoding="utf-8")
    write_report(dataset, train_data, test_data, metrics_dataset, model_paths)

    print("Experimental training completed.")
    print(f"Metrics: {METRICS_PATH}")
    print(f"Confusion matrix: {CONFUSION_MATRIX_PATH}")
    print(f"Report: {REPORT_PATH}")
    print(f"Models directory: {MODELS_DIR}")


if __name__ == "__main__":
    run_training()
