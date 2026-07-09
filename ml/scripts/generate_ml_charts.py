from __future__ import annotations

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs"
os.environ.setdefault("MPLCONFIGDIR", str(OUTPUTS_DIR / ".matplotlib-cache"))

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import log_loss
from sklearn.model_selection import StratifiedKFold, learning_curve

from train_experimental_models_100 import (
    FEATURE_COLUMNS,
    RANDOM_STATE,
    TARGET_COLUMN,
    build_models,
    load_training_dataset,
)


CHARTS_DIR = OUTPUTS_DIR / "charts"

METRICS_PATH = OUTPUTS_DIR / "experimental_model_metrics_100.csv"
CONFUSION_MATRIX_PATH = OUTPUTS_DIR / "confusion_matrix_100.csv"
DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_experimental_100_dataset.csv"

DPI = 300
FIGSIZE_BAR = (11, 7)
FIGSIZE_HEATMAP = (10, 8)
FIGSIZE_CARD = (5, 7)
PRIMARY_COLOR = "#3B82F6"
SECONDARY_COLOR = "#64748B"
GRID_COLOR = "#E2E8F0"
HEATMAP_CMAP = "Blues"

MODEL_LABELS = {
    "random_forest": "Random Forest",
    "svm": "SVM",
    "knn": "KNN",
    "decision_tree": "Decision Tree",
    "logistic_regression": "Logistic Regression",
}

PROFILE_LABELS = {
    "arte-comunicacion-diseno": "Arte, comunicacion\ny diseno",
    "ciencia-datos-investigacion": "Ciencia, datos\ne investigacion",
    "educacion-ciencias-sociales": "Educacion y\nciencias sociales",
    "ingenieria-tecnologia": "Ingenieria y\ntecnologia",
    "negocios-gestion": "Negocios y\ngestion",
    "salud-apoyo-humano": "Salud y\napoyo humano",
}


def configure_axes(ax: plt.Axes, y_label: str) -> None:
    ax.set_ylabel(y_label, fontsize=12)
    ax.set_xlabel("Modelo", fontsize=12)
    ax.tick_params(axis="x", labelrotation=25, labelsize=10)
    ax.tick_params(axis="y", labelsize=10)
    ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def add_bar_labels(ax: plt.Axes, values: pd.Series, percentage: bool = True) -> None:
    for index, value in enumerate(values):
        label = f"{value:.1%}" if percentage else str(int(value))
        ax.text(index, value + 0.015, label, ha="center", va="bottom", fontsize=10)


def save_metric_chart(metrics: pd.DataFrame, metric_column: str, title: str, file_name: str) -> Path:
    ordered = metrics.sort_values(metric_column, ascending=False).copy()
    labels = ordered["model"].map(MODEL_LABELS).fillna(ordered["model"])
    values = ordered[metric_column]

    fig, ax = plt.subplots(figsize=FIGSIZE_BAR)
    ax.bar(labels, values, color=PRIMARY_COLOR, edgecolor="#1E3A8A", linewidth=0.8)
    ax.set_title(title, fontsize=16, fontweight="bold", pad=16)
    ax.set_ylim(0, 1.05)
    configure_axes(ax, "Puntaje")
    add_bar_labels(ax, values)
    fig.tight_layout()

    output_path = CHARTS_DIR / file_name
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_best_model_card(metrics: pd.DataFrame) -> Path:
    best = metrics.sort_values("f1_macro", ascending=False).iloc[0]
    model_name = MODEL_LABELS.get(best["model"], best["model"])

    fig, ax = plt.subplots(figsize=FIGSIZE_CARD)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    card = plt.Rectangle(
        (0.08, 0.06),
        0.84,
        0.88,
        facecolor="#F8FAFC",
        edgecolor="#BFDBFE",
        linewidth=2,
        zorder=0,
    )
    ax.add_patch(card)

    ax.text(
        0.5,
        0.86,
        "Mejor modelo preliminar",
        ha="center",
        va="center",
        fontsize=13,
        fontweight="bold",
        color="#1E40AF",
    )
    ax.text(
        0.5,
        0.73,
        model_name.upper(),
        ha="center",
        va="center",
        fontsize=18,
        fontweight="bold",
        color="#1D4ED8",
        wrap=True,
    )
    ax.text(
        0.5,
        0.59,
        f"Accuracy: {best['accuracy']:.2f}\nF1 macro: {best['f1_macro']:.4f}",
        ha="center",
        va="center",
        fontsize=13,
        color="#0F172A",
        linespacing=1.5,
    )

    # Curva ilustrativa de aprendizaje para una tarjeta ejecutiva; no representa epochs reales.
    x_values = pd.Series(range(80)) / 79
    y_values = 1 / (1 + pd.Series([2.71828 ** (-10 * (x - 0.5)) for x in x_values]))
    inset = fig.add_axes([0.24, 0.16, 0.52, 0.25])
    inset.plot(x_values, y_values, color="#2563EB", linewidth=2.5)
    inset.fill_between(x_values, y_values, color="#DBEAFE", alpha=0.8)
    inset.set_xticks([])
    inset.set_yticks([])
    inset.set_xlim(0, 1)
    inset.set_ylim(0, 1.05)
    for spine in inset.spines.values():
        spine.set_color("#93C5FD")

    output_path = CHARTS_DIR / "00_tarjeta_mejor_modelo_preliminar.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_all_metrics_comparison_chart(metrics: pd.DataFrame) -> Path:
    ordered = metrics.sort_values("f1_macro", ascending=False).copy()
    labels = ordered["model"].map(MODEL_LABELS).fillna(ordered["model"])
    metric_columns = ["accuracy", "precision_macro", "recall_macro", "f1_macro"]
    metric_labels = ["Accuracy", "Precision macro", "Recall macro", "F1 macro"]

    x_positions = range(len(ordered))
    width = 0.18
    offsets = [-1.5 * width, -0.5 * width, 0.5 * width, 1.5 * width]
    colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"]

    fig, ax = plt.subplots(figsize=(13, 7))
    for offset, column, label, color in zip(offsets, metric_columns, metric_labels, colors):
        positions = [position + offset for position in x_positions]
        ax.bar(positions, ordered[column], width=width, label=label, color=color)

    ax.set_title("Comparacion general de metricas por modelo", fontsize=16, fontweight="bold", pad=16)
    ax.set_ylabel("Puntaje", fontsize=12)
    ax.set_xlabel("Modelo", fontsize=12)
    ax.set_ylim(0, 1.05)
    ax.set_xticks(list(x_positions))
    ax.set_xticklabels(labels, rotation=20, ha="right", fontsize=10)
    ax.tick_params(axis="y", labelsize=10)
    ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="lower right", frameon=True)
    fig.tight_layout()

    output_path = CHARTS_DIR / "07_comparacion_general_metricas_modelos.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_all_metrics_line_chart(metrics: pd.DataFrame) -> Path:
    ordered = metrics.sort_values("f1_macro", ascending=False).copy()
    labels = ordered["model"].map(MODEL_LABELS).fillna(ordered["model"]).tolist()
    metric_columns = ["accuracy", "precision_macro", "recall_macro", "f1_macro"]
    metric_labels = ["Accuracy", "Precision macro", "Recall macro", "F1 macro"]
    colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"]
    markers = ["o", "s", "^", "D"]

    fig, ax = plt.subplots(figsize=(13, 7))
    for column, label, color, marker in zip(metric_columns, metric_labels, colors, markers):
        ax.plot(
            labels,
            ordered[column],
            marker=marker,
            markersize=8,
            linewidth=2.5,
            color=color,
            label=label,
        )
        for index, value in enumerate(ordered[column]):
            ax.text(index, value + 0.018, f"{value:.2f}", ha="center", va="bottom", fontsize=9, color=color)

    ax.set_title("Comparacion general de metricas por modelo", fontsize=16, fontweight="bold", pad=16)
    ax.set_ylabel("Puntaje", fontsize=12)
    ax.set_xlabel("Modelo", fontsize=12)
    ax.set_ylim(0, 1.05)
    ax.tick_params(axis="x", labelrotation=20, labelsize=10)
    ax.tick_params(axis="y", labelsize=10)
    ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="lower right", frameon=True)
    fig.tight_layout()

    output_path = CHARTS_DIR / "08_comparacion_general_metricas_modelos_lineas.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_all_metrics_zoomed_line_chart(metrics: pd.DataFrame) -> Path:
    ordered = metrics.sort_values("f1_macro", ascending=False).copy()
    labels = ordered["model"].map(MODEL_LABELS).fillna(ordered["model"]).tolist()
    top_models = ordered[ordered["model"] != "decision_tree"].copy()
    top_labels = top_models["model"].map(MODEL_LABELS).fillna(top_models["model"]).tolist()
    metric_columns = ["accuracy", "precision_macro", "recall_macro", "f1_macro"]
    metric_labels = ["Accuracy", "Precision macro", "Recall macro", "F1 macro"]
    colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"]
    markers = ["o", "s", "^", "D"]
    line_styles = ["-", "--", "-.", ":"]

    fig, axes = plt.subplots(2, 1, figsize=(15, 10.5), gridspec_kw={"height_ratios": [1.15, 1]})

    for ax, data, chart_labels, y_min, y_max, subtitle in [
        (
            axes[0],
            ordered,
            labels,
            0.35,
            1.0,
            "Comparacion de todos los modelos evaluados (5 modelos)",
        ),
        (
            axes[1],
            top_models,
            top_labels,
            0.84,
            0.96,
            "Acercamiento a los cuatro modelos con mejor rendimiento",
        ),
    ]:
        for column, label, color, marker, style in zip(
            metric_columns,
            metric_labels,
            colors,
            markers,
            line_styles,
        ):
            values = data[column].tolist()
            ax.plot(
                chart_labels,
                values,
                marker=marker,
                markersize=8,
                linewidth=2.5,
                linestyle=style,
                color=color,
                label=label,
            )
            for index, value in enumerate(values):
                label_offset = 0.014 if ax is axes[0] else 0.004
                ax.text(
                    index,
                    value + label_offset,
                    f"{value:.4f}",
                    ha="center",
                    va="bottom",
                    fontsize=8,
                    color=color,
                    bbox={
                        "boxstyle": "round,pad=0.18",
                        "facecolor": "white",
                        "edgecolor": color,
                        "linewidth": 0.5,
                        "alpha": 0.85,
                    },
                )

        ax.set_title(subtitle, fontsize=13, fontweight="bold", pad=12)
        ax.set_ylabel("Puntaje", fontsize=11)
        ax.set_ylim(y_min, y_max)
        ax.tick_params(axis="x", labelrotation=0, labelsize=10)
        ax.tick_params(axis="y", labelsize=10)
        ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
        ax.set_axisbelow(True)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

    axes[1].set_xlabel("Modelo", fontsize=12)
    axes[0].legend(loc="lower right", frameon=True)
    fig.suptitle("Comparacion ampliada de metricas por modelo", fontsize=17, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.96])

    output_path = CHARTS_DIR / "09_comparacion_metricas_modelos_lineas_ampliada.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_best_model_learning_curves() -> Path:
    dataset = load_training_dataset()
    x_data = dataset[FEATURE_COLUMNS]
    y_data = dataset[TARGET_COLUMN]
    model = build_models()["logistic_regression"]
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)
    train_sizes = np.array([0.5, 0.65, 0.8, 1.0])
    labels = sorted(y_data.unique().tolist())
    label_positions = {label: index for index, label in enumerate(labels)}

    def aligned_log_loss_scorer(estimator: object, x_values: pd.DataFrame, y_true: pd.Series) -> float:
        probabilities = estimator.predict_proba(x_values)
        estimator_labels = estimator.classes_
        aligned_probabilities = np.full((len(y_true), len(labels)), 1e-15)

        for column_index, label in enumerate(estimator_labels):
            aligned_probabilities[:, label_positions[label]] = probabilities[:, column_index]

        aligned_probabilities = aligned_probabilities / aligned_probabilities.sum(axis=1, keepdims=True)
        return -log_loss(y_true, aligned_probabilities, labels=labels)

    sizes_acc, train_acc, validation_acc = learning_curve(
        model,
        x_data,
        y_data,
        train_sizes=train_sizes,
        cv=cv,
        scoring="accuracy",
        n_jobs=None,
    )
    sizes_loss, train_loss, validation_loss = learning_curve(
        model,
        x_data,
        y_data,
        train_sizes=train_sizes,
        cv=cv,
        scoring=aligned_log_loss_scorer,
        n_jobs=None,
    )

    train_acc_mean = train_acc.mean(axis=1)
    validation_acc_mean = validation_acc.mean(axis=1)
    train_loss_mean = -train_loss.mean(axis=1)
    validation_loss_mean = -validation_loss.mean(axis=1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    axes[0].plot(sizes_acc, train_acc_mean, marker="o", linewidth=2.5, label="Entrenamiento")
    axes[0].plot(sizes_acc, validation_acc_mean, marker="s", linewidth=2.5, label="Validacion")
    axes[0].set_title("Logistic Regression - Accuracy", fontsize=14, fontweight="bold")
    axes[0].set_xlabel("Registros de entrenamiento", fontsize=11)
    axes[0].set_ylabel("Accuracy", fontsize=11)
    axes[0].set_ylim(0.5, 1.05)

    axes[1].plot(sizes_loss, train_loss_mean, marker="o", linewidth=2.5, label="Entrenamiento")
    axes[1].plot(sizes_loss, validation_loss_mean, marker="s", linewidth=2.5, label="Validacion")
    axes[1].set_title("Logistic Regression - Log loss", fontsize=14, fontweight="bold")
    axes[1].set_xlabel("Registros de entrenamiento", fontsize=11)
    axes[1].set_ylabel("Perdida logaritmica", fontsize=11)

    for ax in axes:
        ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
        ax.set_axisbelow(True)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.legend(frameon=True)

    for index, value in enumerate(train_acc_mean):
        axes[0].text(sizes_acc[index], value + 0.015, f"{value:.4f}", ha="center", fontsize=8)
    for index, value in enumerate(validation_acc_mean):
        axes[0].text(sizes_acc[index], value - 0.045, f"{value:.4f}", ha="center", fontsize=8)
    for index, value in enumerate(train_loss_mean):
        axes[1].text(sizes_loss[index], value + 0.035, f"{value:.4f}", ha="center", fontsize=8)
    for index, value in enumerate(validation_loss_mean):
        axes[1].text(sizes_loss[index], value + 0.035, f"{value:.4f}", ha="center", fontsize=8)

    fig.suptitle("Curvas de aprendizaje del mejor modelo preliminar", fontsize=16, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.94])

    output_path = CHARTS_DIR / "10_curvas_aprendizaje_logistic_regression.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_profile_distribution_chart(dataset: pd.DataFrame) -> Path:
    distribution = dataset["final_profile_code"].value_counts().sort_values(ascending=False)
    labels = [PROFILE_LABELS.get(profile, profile) for profile in distribution.index]

    fig, ax = plt.subplots(figsize=(12, 7))
    ax.bar(labels, distribution.values, color=SECONDARY_COLOR, edgecolor="#334155", linewidth=0.8)
    ax.set_title("Distribucion de perfiles en el dataset experimental", fontsize=16, fontweight="bold", pad=16)
    ax.set_ylabel("Cantidad de registros", fontsize=12)
    ax.set_xlabel("Perfil principal", fontsize=12)
    ax.tick_params(axis="x", labelrotation=20, labelsize=10)
    ax.tick_params(axis="y", labelsize=10)
    ax.grid(axis="y", color=GRID_COLOR, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    add_bar_labels(ax, pd.Series(distribution.values), percentage=False)
    fig.tight_layout()

    output_path = CHARTS_DIR / "05_distribucion_perfiles_dataset_experimental.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def save_best_model_confusion_heatmap(metrics: pd.DataFrame, confusion_data: pd.DataFrame) -> Path:
    best_model = metrics.sort_values("f1_macro", ascending=False).iloc[0]["model"]
    model_matrix = confusion_data[confusion_data["model"] == best_model]
    labels = sorted(model_matrix["true_label"].unique().tolist())
    matrix = (
        model_matrix
        .pivot(index="true_label", columns="predicted_label", values="count")
        .reindex(index=labels, columns=labels)
        .fillna(0)
        .astype(int)
    )
    display_labels = [PROFILE_LABELS.get(label, label) for label in labels]

    fig, ax = plt.subplots(figsize=FIGSIZE_HEATMAP)
    image = ax.imshow(matrix.values, cmap=HEATMAP_CMAP)
    cbar = fig.colorbar(image, ax=ax)
    cbar.set_label("Cantidad de casos", fontsize=11)

    ax.set_title(
        f"Matriz de confusión del mejor modelo ({MODEL_LABELS.get(best_model, best_model)})",
        fontsize=16,
        fontweight="bold",
        pad=16,
    )
    ax.set_xlabel("Perfil predicho", fontsize=12)
    ax.set_ylabel("Perfil real", fontsize=12)
    ax.set_xticks(range(len(labels)))
    ax.set_yticks(range(len(labels)))
    ax.set_xticklabels(display_labels, rotation=35, ha="right", fontsize=9)
    ax.set_yticklabels(display_labels, fontsize=9)

    max_value = matrix.values.max()
    threshold = max_value / 2 if max_value else 0
    for row_index in range(matrix.shape[0]):
        for column_index in range(matrix.shape[1]):
            value = matrix.values[row_index, column_index]
            text_color = "white" if value > threshold else "#0F172A"
            ax.text(column_index, row_index, str(value), ha="center", va="center", color=text_color, fontsize=11)

    fig.tight_layout()

    output_path = CHARTS_DIR / f"06_matriz_confusion_mejor_modelo_{best_model}.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)

    return output_path


def generate_charts() -> list[Path]:
    CHARTS_DIR.mkdir(parents=True, exist_ok=True)
    metrics = pd.read_csv(METRICS_PATH)
    confusion_data = pd.read_csv(CONFUSION_MATRIX_PATH)
    dataset = pd.read_csv(DATASET_PATH)

    chart_paths = [
        save_best_model_card(metrics),
        save_metric_chart(
            metrics,
            "accuracy",
            "Comparacion de accuracy por modelo",
            "01_comparacion_accuracy_modelos.png",
        ),
        save_metric_chart(
            metrics,
            "f1_macro",
            "Comparacion de F1 macro por modelo",
            "02_comparacion_f1_macro_modelos.png",
        ),
        save_metric_chart(
            metrics,
            "precision_macro",
            "Comparacion de precision macro por modelo",
            "03_comparacion_precision_macro_modelos.png",
        ),
        save_metric_chart(
            metrics,
            "recall_macro",
            "Comparacion de recall macro por modelo",
            "04_comparacion_recall_macro_modelos.png",
        ),
        save_profile_distribution_chart(dataset),
        save_best_model_confusion_heatmap(metrics, confusion_data),
        save_all_metrics_comparison_chart(metrics),
        save_all_metrics_line_chart(metrics),
        save_all_metrics_zoomed_line_chart(metrics),
        save_best_model_learning_curves(),
    ]

    return chart_paths


def main() -> None:
    chart_paths = generate_charts()
    print("ML charts generated.")
    for path in chart_paths:
        print(path)


if __name__ == "__main__":
    main()
