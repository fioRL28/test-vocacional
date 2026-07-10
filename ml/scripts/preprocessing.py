from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "raw" / "vocational_raw_dataset.csv"
PROCESSED_DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_clean_dataset.csv"
QUALITY_REPORT_PATH = PROJECT_ROOT / "ml" / "outputs" / "data_quality_report.txt"

RIASEC_COLUMNS = [
    "riasec_realista",
    "riasec_investigativo",
    "riasec_artistico",
    "riasec_social",
    "riasec_emprendedor",
    "riasec_convencional",
]
BIG_FIVE_COLUMNS = [
    "big_five_apertura",
    "big_five_responsabilidad",
    "big_five_extraversion",
    "big_five_amabilidad",
    "big_five_neuroticismo",
]
CONTEXT_COLUMNS = [
    "incertidumbre_vocacional",
    "presion_externa",
    "tolerancia_dificultad",
]
SCORE_COLUMNS = RIASEC_COLUMNS + BIG_FIVE_COLUMNS + CONTEXT_COLUMNS
IMPORTANT_COLUMNS = [
    "anonymous_participant_id",
    "created_at",
    "final_profile_code",
    "final_profile_name",
    "likert_answer_count",
    *SCORE_COLUMNS,
]
TEXT_COLUMNS = [
    "open_answers_text",
    "compatible_route_codes",
    "compatible_route_names",
]


def remove_missing_values(dataset: pd.DataFrame) -> pd.DataFrame:
    """Remove rows missing fields required for supervised training."""
    available_columns = [column for column in IMPORTANT_COLUMNS if column in dataset.columns]
    cleaned = dataset.copy()

    if "likert_answer_count" in cleaned.columns:
        cleaned["likert_answer_count"] = pd.to_numeric(
            cleaned["likert_answer_count"],
            errors="coerce",
        )
        cleaned = cleaned[cleaned["likert_answer_count"] > 0]

    if available_columns:
        cleaned = cleaned.dropna(subset=available_columns)

    return cleaned


def remove_duplicates(dataset: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicated sessions or repeated anonymous-result rows."""
    cleaned = dataset.copy()

    if "session_id" in cleaned.columns:
        cleaned = cleaned.drop_duplicates(subset=["session_id"], keep="last")

    duplicate_subset = [
        column
        for column in ["anonymous_participant_id", "created_at", "final_profile_code"]
        if column in cleaned.columns
    ]
    if duplicate_subset:
        cleaned = cleaned.drop_duplicates(subset=duplicate_subset, keep="last")

    return cleaned


def normalize_text(value: str | None) -> str:
    """Normalize free text for future NLP or dictionary-based features."""
    if value is None or pd.isna(value):
        return ""

    normalized = unicodedata.normalize("NFKD", str(value))
    normalized = "".join(character for character in normalized if not unicodedata.combining(character))
    normalized = normalized.lower()
    normalized = re.sub(r"<[^>]+>", " ", normalized)
    normalized = re.sub(r"[^a-z0-9\s.,;:?!()/-]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized)

    return normalized.strip()


def normalize_profile(value: str | None) -> str:
    """Normalize profile labels while preserving a readable canonical name."""
    text = normalize_text(value)
    replacements = {
        "ingenieria, tecnologia y sistemas": "ingenieria-tecnologia",
        "ingenieria tecnologia y sistemas": "ingenieria-tecnologia",
        "ingenieria y tecnologia": "ingenieria-tecnologia",
        "ciencia, datos e investigacion": "ciencia-datos-investigacion",
        "ciencia datos e investigacion": "ciencia-datos-investigacion",
        "salud, psicologia y apoyo humano": "salud-apoyo-humano",
        "salud psicologia y apoyo humano": "salud-apoyo-humano",
        "educacion y ciencias sociales": "educacion-ciencias-sociales",
        "arte, comunicacion y diseno": "arte-comunicacion-diseno",
        "arte comunicacion y diseno": "arte-comunicacion-diseno",
        "negocios, gestion y emprendimiento": "negocios-gestion",
        "negocios gestion y emprendimiento": "negocios-gestion",
        "administracion, finanzas y gestion operativa": "administracion-finanzas",
        "administracion finanzas y gestion operativa": "administracion-finanzas",
    }

    return replacements.get(text, text.replace(" ", "-"))


def clean_text_columns(dataset: pd.DataFrame) -> pd.DataFrame:
    cleaned = dataset.copy()

    for column in TEXT_COLUMNS:
        if column in cleaned.columns:
            cleaned[column] = cleaned[column].apply(normalize_text)

    return cleaned


def encode_categories(dataset: pd.DataFrame) -> pd.DataFrame:
    """Normalize categorical labels without fitting ML encoders yet."""
    cleaned = dataset.copy()

    for column in ["final_profile_code", "predicted_profile_code"]:
        if column in cleaned.columns:
            cleaned[column] = cleaned[column].apply(normalize_profile)

    for column in ["final_profile_name", "predicted_profile_name"]:
        if column in cleaned.columns:
            cleaned[column] = cleaned[column].apply(normalize_text)

    return cleaned


def validate_ranges(dataset: pd.DataFrame) -> pd.DataFrame:
    """Keep only rows with valid 1-5 score ranges in Likert-derived fields."""
    cleaned = dataset.copy()

    for column in SCORE_COLUMNS:
        if column in cleaned.columns:
            cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")
            cleaned = cleaned[cleaned[column].between(1, 5, inclusive="both")]

    if "confidence_score" in cleaned.columns:
        cleaned["confidence_score"] = pd.to_numeric(cleaned["confidence_score"], errors="coerce")
        cleaned = cleaned[
            cleaned["confidence_score"].isna() |
            cleaned["confidence_score"].between(0, 100, inclusive="both")
        ]

    if "likert_answers_json" in cleaned.columns:
        cleaned = cleaned[cleaned["likert_answers_json"].apply(likert_json_has_valid_range)]

    return cleaned


def likert_json_has_valid_range(value: str | None) -> bool:
    if value is None or pd.isna(value) or not str(value).strip():
        return False

    try:
        answers = json.loads(str(value))
    except json.JSONDecodeError:
        return False

    if not isinstance(answers, list) or not answers:
        return False

    for answer in answers:
        if not isinstance(answer, dict):
            return False
        score = pd.to_numeric(answer.get("value"), errors="coerce")
        if pd.isna(score) or score < 1 or score > 5:
            return False

    return True


def remove_empty_open_answers(dataset: pd.DataFrame) -> pd.DataFrame:
    """Normalize empty open-answer fields without requiring every session to have one."""
    cleaned = dataset.copy()

    if "open_answers_text" in cleaned.columns:
        cleaned["open_answers_text"] = cleaned["open_answers_text"].fillna("").apply(normalize_text)

    if "open_answers_json" in cleaned.columns:
        cleaned["open_answers_json"] = cleaned["open_answers_json"].fillna("")

    return cleaned


def clean_dataset(dataset: pd.DataFrame) -> pd.DataFrame:
    """Run the preprocessing pipeline in a predictable order."""
    cleaned = remove_missing_values(dataset)
    cleaned = remove_duplicates(cleaned)
    cleaned = remove_empty_open_answers(cleaned)
    cleaned = clean_text_columns(cleaned)
    cleaned = encode_categories(cleaned)
    cleaned = validate_ranges(cleaned)

    return cleaned.reset_index(drop=True)


def generate_quality_report(
    raw_dataset: pd.DataFrame,
    clean_dataset_result: pd.DataFrame,
    report_path: Path = QUALITY_REPORT_PATH,
) -> str:
    original_total = len(raw_dataset)
    valid_total = len(clean_dataset_result)
    removed_total = original_total - valid_total
    null_counts = raw_dataset.isna().sum()
    columns_with_nulls = null_counts[null_counts > 0].sort_values(ascending=False)

    report_lines = [
        "Reporte de calidad de datos - Test vocacional adaptativo",
        "=" * 62,
        f"Total de registros originales: {original_total}",
        f"Total de registros eliminados: {removed_total}",
        f"Total de registros validos: {valid_total}",
        "",
        "Columnas con valores nulos:",
    ]

    if columns_with_nulls.empty:
        report_lines.append("- Sin valores nulos detectados.")
    else:
        report_lines.extend(f"- {column}: {count}" for column, count in columns_with_nulls.items())

    report_lines.extend([
        "",
        "Distribucion de perfiles principales:",
        *format_distribution(clean_dataset_result, "final_profile_code"),
        "",
        "Distribucion de incertidumbre vocacional:",
        *format_numeric_distribution(clean_dataset_result, "incertidumbre_vocacional"),
        "",
        "Distribucion de presion externa:",
        *format_numeric_distribution(clean_dataset_result, "presion_externa"),
        "",
        "Advertencias:",
    ])
    warnings = build_quality_warnings(clean_dataset_result)
    report_lines.extend(warnings or ["- Sin advertencias criticas detectadas."])

    report = "\n".join(report_lines) + "\n"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding="utf-8")

    return report


def format_distribution(dataset: pd.DataFrame, column: str) -> list[str]:
    if column not in dataset.columns or dataset.empty:
        return ["- Sin datos disponibles."]

    distribution = dataset[column].value_counts(dropna=False)
    return [
        f"- {value}: {count} ({count / max(1, len(dataset)):.1%})"
        for value, count in distribution.items()
    ]


def format_numeric_distribution(dataset: pd.DataFrame, column: str) -> list[str]:
    if column not in dataset.columns or dataset.empty:
        return ["- Sin datos disponibles."]

    rounded = pd.to_numeric(dataset[column], errors="coerce").round().astype("Int64")
    distribution = rounded.value_counts(dropna=False).sort_index()
    return [
        f"- {value}/5: {count} ({count / max(1, len(dataset)):.1%})"
        for value, count in distribution.items()
    ]


def build_quality_warnings(dataset: pd.DataFrame) -> list[str]:
    if dataset.empty:
        return ["- No hay registros validos para evaluar sesgos o distribuciones."]

    warnings: list[str] = []
    available_score_columns = [column for column in SCORE_COLUMNS if column in dataset.columns]

    if available_score_columns:
        scores = dataset[available_score_columns].apply(pd.to_numeric, errors="coerce")
        high_ratio = (scores >= 4).sum().sum() / max(1, scores.notna().sum().sum())
        max_ratio = (scores == 5).sum().sum() / max(1, scores.notna().sum().sum())

        if high_ratio >= 0.70:
            warnings.append(
                f"- Demasiados valores 4/5 o 5/5 en escalas Likert ({high_ratio:.1%}). Revisar aquiescencia o sesgo de respuesta."
            )
        if max_ratio >= 0.45:
            warnings.append(
                f"- Demasiados valores 5/5 en escalas Likert ({max_ratio:.1%}). Puede faltar discriminacion entre perfiles."
            )

    if "final_profile_code" in dataset.columns:
        profile_distribution = dataset["final_profile_code"].value_counts(normalize=True)
        engineering_ratio = float(profile_distribution.get("ingenieria-tecnologia", 0))

        if engineering_ratio >= 0.40:
            warnings.append(
                f"- Sesgo fuerte hacia Ingenieria, Tecnologia y Sistemas ({engineering_ratio:.1%} de perfiles principales)."
            )

    if len(dataset) < 30:
        warnings.append("- Muestra pequena: usar solo para inspeccion; todavia no es robusta para entrenamiento.")

    return warnings


def preprocess_dataset(
    raw_path: Path = RAW_DATASET_PATH,
    processed_path: Path = PROCESSED_DATASET_PATH,
    report_path: Path = QUALITY_REPORT_PATH,
) -> pd.DataFrame:
    raw_dataset = pd.read_csv(raw_path)
    cleaned = clean_dataset(raw_dataset)

    processed_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(processed_path, index=False, encoding="utf-8")
    generate_quality_report(raw_dataset, cleaned, report_path)

    return cleaned


def main() -> None:
    cleaned = preprocess_dataset()
    print(f"Saved {len(cleaned)} clean rows to {PROCESSED_DATASET_PATH}")


if __name__ == "__main__":
    main()
