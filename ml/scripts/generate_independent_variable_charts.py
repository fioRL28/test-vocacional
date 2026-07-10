from __future__ import annotations

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs"
CHARTS_DIR = OUTPUTS_DIR / "charts"
os.environ.setdefault("MPLCONFIGDIR", str(OUTPUTS_DIR / ".matplotlib-cache"))

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd


DETAIL_PATH = OUTPUTS_DIR / "independent_variable_measurement_details.csv"
SUMMARY_PATH = OUTPUTS_DIR / "independent_variable_measurements.csv"
RAW_DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "raw" / "vocational_raw_dataset.csv"
CLEAN_DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_clean_dataset.csv"

DPI = 300
BLUE = "#2563EB"
GREEN = "#10B981"
AMBER = "#F59E0B"
SLATE = "#475569"
GRID = "#E2E8F0"


def style_axis(ax: plt.Axes) -> None:
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def save_consistency_chart(detail: pd.DataFrame) -> Path:
    value = detail["consistency_score"].mean()

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(detail["consistency_score"], bins=[0, 50, 60, 70, 80, 90, 100], color=BLUE, edgecolor="#1E3A8A")
    ax.axvline(value, color=AMBER, linewidth=2.5, label=f"Promedio: {value:.2f}%")
    ax.set_title("Consistencia de respuestas", fontsize=15, fontweight="bold", pad=14)
    ax.set_xlabel("Consistency score (%)", fontsize=11)
    ax.set_ylabel("Cantidad de registros", fontsize=11)
    ax.legend(frameon=True)
    style_axis(ax)
    fig.tight_layout()

    output_path = CHARTS_DIR / "11_consistencia_respuestas.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    return output_path


def save_affinity_chart(detail: pd.DataFrame) -> Path:
    labels = ["Perfil recomendado", "Perfil registrado"]
    values = [
        detail["affinity_score_recommended_profile"].mean(),
        detail["affinity_score_final_profile"].mean(),
    ]

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, values, color=[GREEN, SLATE], edgecolor="#0F172A", linewidth=0.8)
    ax.set_title("Afinidad vocacional promedio", fontsize=15, fontweight="bold", pad=14)
    ax.set_ylabel("Puntos ponderados", fontsize=11)
    style_axis(ax)
    for bar, value in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            value + 0.15,
            f"{value:.4f}",
            ha="center",
            va="bottom",
            fontsize=10,
        )
    fig.tight_layout()

    output_path = CHARTS_DIR / "12_afinidad_vocacional.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    return output_path


def save_processing_quality_chart() -> Path:
    raw_total = len(pd.read_csv(RAW_DATASET_PATH))
    clean_total = len(pd.read_csv(CLEAN_DATASET_PATH))
    removed_total = raw_total - clean_total
    quality = clean_total / raw_total * 100 if raw_total else 0

    fig, axes = plt.subplots(1, 2, figsize=(11, 5), gridspec_kw={"width_ratios": [1.2, 1]})
    labels = ["Originales", "Validos", "Eliminados"]
    values = [raw_total, clean_total, removed_total]
    axes[0].bar(labels, values, color=[SLATE, GREEN, AMBER], edgecolor="#0F172A", linewidth=0.8)
    axes[0].set_title("Registros procesados", fontsize=13, fontweight="bold")
    axes[0].set_ylabel("Cantidad", fontsize=11)
    for index, value in enumerate(values):
        axes[0].text(index, value + 0.6, str(value), ha="center", va="bottom", fontsize=10)
    style_axis(axes[0])

    axes[1].bar(["CP"], [quality], color=GREEN, edgecolor="#0F172A", linewidth=0.8)
    axes[1].set_title("Calidad de procesamiento", fontsize=13, fontweight="bold")
    axes[1].set_ylabel("Porcentaje", fontsize=11)
    axes[1].set_ylim(0, 110)
    axes[1].text(0, quality + 2, f"{quality:.2f}%", ha="center", va="bottom", fontsize=11)
    style_axis(axes[1])
    fig.suptitle("Calidad de procesamiento de datos", fontsize=15, fontweight="bold")
    fig.tight_layout()

    output_path = CHARTS_DIR / "13_calidad_procesamiento.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    return output_path


def save_summary_chart(summary: pd.DataFrame) -> Path:
    percent_rows = summary[summary["unit"] == "%"].copy()

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(percent_rows["dimension"], percent_rows["result"], color=[BLUE, GREEN, AMBER])
    ax.set_title("Indicadores porcentuales de la variable independiente", fontsize=15, fontweight="bold", pad=14)
    ax.set_ylabel("Porcentaje", fontsize=11)
    ax.set_ylim(0, 110)
    ax.tick_params(axis="x", labelrotation=15)
    style_axis(ax)
    for bar, value in zip(bars, percent_rows["result"]):
        ax.text(bar.get_x() + bar.get_width() / 2, value + 2, f"{value:.2f}%", ha="center", fontsize=10)
    fig.tight_layout()

    output_path = CHARTS_DIR / "14_indicadores_porcentuales_variable_independiente.png"
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    return output_path


def main() -> None:
    CHARTS_DIR.mkdir(parents=True, exist_ok=True)
    detail = pd.read_csv(DETAIL_PATH)
    summary = pd.read_csv(SUMMARY_PATH)
    chart_paths = [
        save_consistency_chart(detail),
        save_affinity_chart(detail),
        save_processing_quality_chart(),
        save_summary_chart(summary),
    ]

    print("Independent variable charts generated.")
    for path in chart_paths:
        print(path)


if __name__ == "__main__":
    main()
