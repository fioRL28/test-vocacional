from __future__ import annotations

from typing import Any

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def calculate_accuracy(y_true: list[Any], y_pred: list[Any]) -> float:
    return float(accuracy_score(y_true, y_pred))


def calculate_precision(y_true: list[Any], y_pred: list[Any]) -> float:
    return float(precision_score(y_true, y_pred, average="weighted", zero_division=0))


def calculate_recall(y_true: list[Any], y_pred: list[Any]) -> float:
    return float(recall_score(y_true, y_pred, average="weighted", zero_division=0))


def calculate_f1_score(y_true: list[Any], y_pred: list[Any]) -> float:
    return float(f1_score(y_true, y_pred, average="weighted", zero_division=0))


def calculate_roc_auc(y_true: list[Any], y_score: list[Any]) -> float:
    return float(roc_auc_score(y_true, y_score, multi_class="ovr"))


def calculate_confusion_matrix(y_true: list[Any], y_pred: list[Any]) -> list[list[int]]:
    matrix = confusion_matrix(y_true, y_pred)
    return matrix.astype(int).tolist()


def evaluate_model(y_true: list[Any], y_pred: list[Any], y_score: list[Any] | None = None) -> dict[str, Any]:
    metrics: dict[str, Any] = {
        "accuracy": calculate_accuracy(y_true, y_pred),
        "precision": calculate_precision(y_true, y_pred),
        "recall": calculate_recall(y_true, y_pred),
        "f1Score": calculate_f1_score(y_true, y_pred),
        "confusionMatrix": calculate_confusion_matrix(y_true, y_pred),
    }

    if y_score is not None:
        metrics["rocAuc"] = calculate_roc_auc(y_true, y_score)

    return metrics
