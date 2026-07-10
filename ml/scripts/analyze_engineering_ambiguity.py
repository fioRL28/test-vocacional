from __future__ import annotations

from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_experimental_100_dataset.csv"
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs"
ANALYSIS_PATH = OUTPUTS_DIR / "engineering_ambiguity_analysis_100.csv"
REPORT_PATH = OUTPUTS_DIR / "engineering_ambiguity_report_100.txt"

ENGINEERING_PROFILE = "ingenieria-tecnologia"

RIASEC_COLUMNS = [
    "riasec_realista",
    "riasec_investigativo",
    "riasec_artistico",
    "riasec_social",
    "riasec_emprendedor",
    "riasec_convencional",
]

RIASEC_LABELS = {
    "riasec_realista": "realista",
    "riasec_investigativo": "investigativo",
    "riasec_artistico": "artistico",
    "riasec_social": "social",
    "riasec_emprendedor": "emprendedor",
    "riasec_convencional": "convencional",
}


def normalized_score(value: float, low: float, high: float) -> float:
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def classify_stability(row: pd.Series) -> str:
    ambiguity = row["profile_ambiguity_score"]
    dominance = row["profile_dominance_score"]
    uncertainty = row["incertidumbre_vocacional"]
    engineering_gap = row["engineering_vs_alternative_gap"]
    high_social_artistic = max(row["riasec_social"], row["riasec_artistico"]) >= 4
    top_is_engineering_family = row["top_riasec_dimension"] in {"realista", "investigativo", "convencional"}

    if (
        (ambiguity >= 70 and engineering_gap <= 0)
        or (ambiguity >= 65 and not top_is_engineering_family)
    ):
        return "ambiguo"
    if uncertainty >= 4 and ambiguity >= 55:
        return "exploratorio"
    if ambiguity >= 45 or high_social_artistic or dominance < 55:
        return "hibrido"
    return "definido"


def suggest_reclassification(row: pd.Series) -> str:
    non_engineering_signals = {
        "salud-apoyo-humano": row["riasec_social"] * 0.65 + row["big_five_amabilidad"] * 0.35,
        "educacion-ciencias-sociales": row["riasec_social"] * 0.45
        + row["big_five_extraversion"] * 0.30
        + row["riasec_artistico"] * 0.25,
        "arte-comunicacion-diseno": row["riasec_artistico"] * 0.70 + row["big_five_apertura"] * 0.30,
        "negocios-gestion": row["riasec_emprendedor"] * 0.65 + row["big_five_extraversion"] * 0.35,
        "ciencia-datos-investigacion": row["riasec_investigativo"] * 0.70
        + row["big_five_apertura"] * 0.30,
    }
    sorted_signals = sorted(non_engineering_signals.items(), key=lambda item: item[1], reverse=True)
    top_route, top_score = sorted_signals[0]
    second_route, second_score = sorted_signals[1]

    if row["profile_stability_label"] == "definido":
        return "mantener-ingenieria"

    if top_score - second_score <= 0.25:
        return f"comparar-con-{top_route}-y-{second_route}"

    return f"revisar-posible-{top_route}"


def analyze_engineering_cases(dataset: pd.DataFrame) -> pd.DataFrame:
    engineering = dataset[dataset["final_profile_code"] == ENGINEERING_PROFILE].copy()
    if engineering.empty:
        return engineering

    riasec = engineering[RIASEC_COLUMNS]
    sorted_riasec_values = riasec.apply(lambda row: sorted(row, reverse=True), axis=1)
    engineering["top_riasec_score"] = sorted_riasec_values.apply(lambda values: values[0])
    engineering["second_riasec_score"] = sorted_riasec_values.apply(lambda values: values[1])
    engineering["riasec_top_gap"] = engineering["top_riasec_score"] - engineering["second_riasec_score"]
    engineering["high_riasec_dimension_count"] = (riasec >= 4).sum(axis=1)
    engineering["top_riasec_dimension"] = riasec.idxmax(axis=1).map(RIASEC_LABELS)

    engineering_signal = (
        engineering["riasec_realista"] * 0.45
        + engineering["riasec_investigativo"] * 0.40
        + engineering["riasec_convencional"] * 0.15
    )
    strongest_alternative_signal = engineering[
        ["riasec_artistico", "riasec_social", "riasec_emprendedor"]
    ].max(axis=1)
    engineering["engineering_signal"] = engineering_signal.round(3)
    engineering["strongest_alternative_signal"] = strongest_alternative_signal.round(3)
    engineering["engineering_vs_alternative_gap"] = (
        engineering_signal - strongest_alternative_signal
    ).round(3)

    dominance_components = (
        normalized_series(engineering["engineering_vs_alternative_gap"], -1.0, 1.5) * 45
        + normalized_series(engineering["riasec_top_gap"], 0.0, 1.5) * 25
        + normalized_series(engineering["confidence_score"], 35.0, 90.0) * 20
        + (1 - normalized_series(engineering["high_riasec_dimension_count"], 3.0, 6.0)) * 10
    )
    ambiguity_components = (
        (1 - normalized_series(engineering["confidence_score"], 35.0, 90.0)) * 25
        + normalized_series(engineering["incertidumbre_vocacional"], 2.0, 5.0) * 25
        + normalized_series(engineering["high_riasec_dimension_count"], 3.0, 6.0) * 25
        + (1 - normalized_series(engineering["riasec_top_gap"], 0.0, 1.5)) * 15
        + normalized_series(strongest_alternative_signal, 3.5, 5.0) * 10
    )

    engineering["profile_dominance_score"] = dominance_components.clip(0, 100).round(2)
    engineering["profile_ambiguity_score"] = ambiguity_components.clip(0, 100).round(2)
    engineering["profile_stability_label"] = engineering.apply(classify_stability, axis=1)
    engineering["potential_reclassification"] = engineering.apply(suggest_reclassification, axis=1)
    engineering["possible_engineering_false_positive"] = (
        engineering["profile_stability_label"].eq("ambiguo")
        | (engineering["engineering_vs_alternative_gap"] < -0.25)
        | (~engineering["top_riasec_dimension"].isin(["realista", "investigativo", "convencional"]))
    )

    analysis_columns = [
        "session_id",
        "anonymous_participant_id",
        "is_synthetic",
        "confidence_score",
        *RIASEC_COLUMNS,
        "big_five_apertura",
        "big_five_responsabilidad",
        "big_five_extraversion",
        "big_five_amabilidad",
        "big_five_neuroticismo",
        "incertidumbre_vocacional",
        "presion_externa",
        "tolerancia_dificultad",
        "top_riasec_dimension",
        "top_riasec_score",
        "second_riasec_score",
        "riasec_top_gap",
        "high_riasec_dimension_count",
        "engineering_signal",
        "strongest_alternative_signal",
        "engineering_vs_alternative_gap",
        "profile_dominance_score",
        "profile_ambiguity_score",
        "profile_stability_label",
        "possible_engineering_false_positive",
        "potential_reclassification",
    ]

    return engineering[analysis_columns].sort_values(
        ["possible_engineering_false_positive", "profile_ambiguity_score"],
        ascending=[False, False],
    )


def normalized_series(series: pd.Series, low: float, high: float) -> pd.Series:
    if high <= low:
        return pd.Series(0.0, index=series.index)
    return ((series - low) / (high - low)).clip(0, 1)


def write_report(analysis: pd.DataFrame, dataset: pd.DataFrame) -> None:
    total_engineering = len(analysis)
    false_positive_count = int(analysis["possible_engineering_false_positive"].sum())
    false_positive_rate = false_positive_count / max(1, total_engineering)
    label_distribution = analysis["profile_stability_label"].value_counts().sort_index()
    suggestions = analysis["potential_reclassification"].value_counts()

    lines = [
        "Reporte de ambiguedad en perfiles clasificados como Ingenieria",
        "=" * 70,
        f"Dataset analizado: {DATASET_PATH}",
        f"Registros totales del dataset: {len(dataset)}",
        f"Registros clasificados como ingenieria-tecnologia: {total_engineering}",
        f"Registros reales dentro de Ingenieria: {int((analysis['is_synthetic'] == False).sum())}",
        f"Registros sinteticos dentro de Ingenieria: {int((analysis['is_synthetic'] == True).sum())}",
        "",
        "Variables creadas:",
        "- profile_dominance_score: fuerza relativa de senal R/I/C frente a senales alternativas y claridad.",
        "- profile_ambiguity_score: baja claridad, incertidumbre, muchas dimensiones RIASEC altas y poco margen entre rutas.",
        "- profile_stability_label: definido, hibrido, exploratorio o ambiguo.",
        "",
        "Distribucion de estabilidad:",
    ]
    lines.extend(f"- {label}: {count}" for label, count in label_distribution.items())

    lines.extend(
        [
            "",
            "Posibles falsos positivos hacia Ingenieria:",
            f"- Cantidad: {false_positive_count}",
            f"- Porcentaje sobre Ingenieria: {false_positive_rate:.1%}",
            "",
            "Sugerencias de reclasificacion potencial:",
        ]
    )
    lines.extend(f"- {suggestion}: {count}" for suggestion, count in suggestions.items())

    top_cases = analysis[analysis["possible_engineering_false_positive"]].head(10)
    lines.extend(["", "Casos prioritarios para revision cualitativa:"])
    if top_cases.empty:
        lines.append("- No se detectaron casos prioritarios.")
    else:
        for row in top_cases.itertuples(index=False):
            lines.append(
                "- "
                f"{row.anonymous_participant_id}: label={row.profile_stability_label}, "
                f"ambiguity={row.profile_ambiguity_score:.1f}, "
                f"dominance={row.profile_dominance_score:.1f}, "
                f"top_riasec={row.top_riasec_dimension}, "
                f"gap={row.riasec_top_gap:.2f}, "
                f"sugerencia={row.potential_reclassification}"
            )

    lines.extend(
        [
            "",
            "Lectura tecnica:",
            "- Una etiqueta hibrido no implica error: puede indicar un perfil multidisciplinario real.",
            "- Exploratorio o ambiguo sugiere baja diferenciacion vocacional y requiere revisar respuestas abiertas o aplicar preguntas de desempate.",
            "- Este analisis no modifica el dataset original ni cambia la logica actual del test.",
        ]
    )

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    dataset = pd.read_csv(DATASET_PATH)
    analysis = analyze_engineering_cases(dataset)

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    analysis.to_csv(ANALYSIS_PATH, index=False, encoding="utf-8")
    write_report(analysis, dataset)

    print("Engineering ambiguity analysis completed.")
    print(f"Analysis CSV: {ANALYSIS_PATH}")
    print(f"Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
