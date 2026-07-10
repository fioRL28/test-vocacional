from __future__ import annotations

import argparse
import json
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

from preprocessing import (
    BIG_FIVE_COLUMNS,
    CONTEXT_COLUMNS,
    PROCESSED_DATASET_PATH,
    RIASEC_COLUMNS,
    SCORE_COLUMNS,
    generate_quality_report,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BALANCED_DATASET_PATH = (
    PROJECT_ROOT / "ml" / "data" / "processed" / "vocational_experimental_100_dataset.csv"
)
SYNTHETIC_REPORT_PATH = PROJECT_ROOT / "ml" / "outputs" / "synthetic_data_quality_report_100.txt"

RANDOM_SEED = 42
MAX_CLASS_TARGET_CAP = 40
MIN_CLASS_TARGET = 20
DEFAULT_TOTAL_ROWS = 100

DEFAULT_ORGANIC_TARGET_DISTRIBUTION = {
    "ingenieria-tecnologia": 33,
    "negocios-gestion": 18,
    "salud-apoyo-humano": 15,
    "ciencia-datos-investigacion": 14,
    "educacion-ciencias-sociales": 11,
    "arte-comunicacion-diseno": 9,
}

PRIORITY_PROFILES = [
    "arte-comunicacion-diseno",
    "educacion-ciencias-sociales",
    "ciencia-datos-investigacion",
    "salud-apoyo-humano",
    "negocios-gestion",
]

PROFILE_NAMES = {
    "ingenieria-tecnologia": "ingenieria, tecnologia y sistemas",
    "ciencia-datos-investigacion": "ciencia, datos e investigacion",
    "salud-apoyo-humano": "salud, psicologia y apoyo humano",
    "educacion-ciencias-sociales": "educacion y ciencias sociales",
    "arte-comunicacion-diseno": "arte, comunicacion y diseno",
    "negocios-gestion": "negocios, gestion y emprendimiento",
    "administracion-finanzas": "administracion, finanzas y gestion operativa",
}

PROFILE_PROTOTYPES = {
    "ingenieria-tecnologia": {
        "riasec_realista": 4.3,
        "riasec_investigativo": 4.1,
        "riasec_artistico": 2.6,
        "riasec_social": 2.8,
        "riasec_emprendedor": 3.2,
        "riasec_convencional": 3.4,
        "big_five_apertura": 4.0,
        "big_five_responsabilidad": 3.8,
        "big_five_extraversion": 3.0,
        "big_five_amabilidad": 3.1,
        "big_five_neuroticismo": 2.8,
        "incertidumbre_vocacional": 2.7,
        "presion_externa": 2.9,
        "tolerancia_dificultad": 4.1,
    },
    "ciencia-datos-investigacion": {
        "riasec_realista": 3.0,
        "riasec_investigativo": 4.6,
        "riasec_artistico": 2.8,
        "riasec_social": 2.7,
        "riasec_emprendedor": 2.5,
        "riasec_convencional": 3.7,
        "big_five_apertura": 4.4,
        "big_five_responsabilidad": 3.9,
        "big_five_extraversion": 2.8,
        "big_five_amabilidad": 3.2,
        "big_five_neuroticismo": 2.9,
        "incertidumbre_vocacional": 2.8,
        "presion_externa": 2.6,
        "tolerancia_dificultad": 4.0,
    },
    "salud-apoyo-humano": {
        "riasec_realista": 2.5,
        "riasec_investigativo": 3.8,
        "riasec_artistico": 3.2,
        "riasec_social": 4.7,
        "riasec_emprendedor": 3.1,
        "riasec_convencional": 3.2,
        "big_five_apertura": 3.8,
        "big_five_responsabilidad": 4.0,
        "big_five_extraversion": 3.5,
        "big_five_amabilidad": 4.6,
        "big_five_neuroticismo": 3.1,
        "incertidumbre_vocacional": 2.9,
        "presion_externa": 3.0,
        "tolerancia_dificultad": 4.1,
    },
    "educacion-ciencias-sociales": {
        "riasec_realista": 2.2,
        "riasec_investigativo": 3.4,
        "riasec_artistico": 3.5,
        "riasec_social": 4.6,
        "riasec_emprendedor": 3.4,
        "riasec_convencional": 3.0,
        "big_five_apertura": 4.0,
        "big_five_responsabilidad": 3.8,
        "big_five_extraversion": 4.0,
        "big_five_amabilidad": 4.4,
        "big_five_neuroticismo": 2.8,
        "incertidumbre_vocacional": 2.7,
        "presion_externa": 2.7,
        "tolerancia_dificultad": 3.9,
    },
    "arte-comunicacion-diseno": {
        "riasec_realista": 2.3,
        "riasec_investigativo": 2.9,
        "riasec_artistico": 4.7,
        "riasec_social": 3.4,
        "riasec_emprendedor": 3.2,
        "riasec_convencional": 2.3,
        "big_five_apertura": 4.7,
        "big_five_responsabilidad": 3.3,
        "big_five_extraversion": 3.5,
        "big_five_amabilidad": 3.5,
        "big_five_neuroticismo": 3.0,
        "incertidumbre_vocacional": 3.1,
        "presion_externa": 2.4,
        "tolerancia_dificultad": 3.7,
    },
    "negocios-gestion": {
        "riasec_realista": 2.8,
        "riasec_investigativo": 2.9,
        "riasec_artistico": 3.0,
        "riasec_social": 3.6,
        "riasec_emprendedor": 4.7,
        "riasec_convencional": 3.7,
        "big_five_apertura": 3.6,
        "big_five_responsabilidad": 4.1,
        "big_five_extraversion": 4.4,
        "big_five_amabilidad": 3.4,
        "big_five_neuroticismo": 2.6,
        "incertidumbre_vocacional": 2.4,
        "presion_externa": 3.2,
        "tolerancia_dificultad": 3.8,
    },
    "administracion-finanzas": {
        "riasec_realista": 2.4,
        "riasec_investigativo": 3.1,
        "riasec_artistico": 2.1,
        "riasec_social": 2.8,
        "riasec_emprendedor": 3.7,
        "riasec_convencional": 4.7,
        "big_five_apertura": 3.0,
        "big_five_responsabilidad": 4.5,
        "big_five_extraversion": 3.1,
        "big_five_amabilidad": 3.2,
        "big_five_neuroticismo": 2.5,
        "incertidumbre_vocacional": 2.3,
        "presion_externa": 3.0,
        "tolerancia_dificultad": 3.7,
    },
}

QUESTION_PLAN = [
    (1, "riasec_realista"),
    (2, "riasec_investigativo"),
    (3, "riasec_artistico"),
    (4, "riasec_social"),
    (5, "riasec_emprendedor"),
    (6, "riasec_convencional"),
    (7, "big_five_apertura"),
    (8, "big_five_responsabilidad"),
    (9, "big_five_extraversion"),
    (10, "big_five_amabilidad"),
    (11, "big_five_neuroticismo"),
    (12, "incertidumbre_vocacional"),
    (13, "presion_externa"),
    (14, "tolerancia_dificultad"),
    (15, "riasec_realista"),
    (16, "riasec_investigativo"),
    (17, "riasec_artistico"),
    (18, "riasec_social"),
    (19, "riasec_emprendedor"),
    (20, "riasec_convencional"),
    (21, "big_five_apertura"),
    (22, "big_five_responsabilidad"),
    (23, "big_five_extraversion"),
    (24, "big_five_amabilidad"),
    (25, "big_five_neuroticismo"),
    (27, "tolerancia_dificultad"),
    (28, "incertidumbre_vocacional"),
    (29, "presion_externa"),
    (30, "big_five_responsabilidad"),
]

DIMENSION_BY_COLUMN = {
    "riasec_realista": "realista",
    "riasec_investigativo": "investigativo",
    "riasec_artistico": "artistico",
    "riasec_social": "social",
    "riasec_emprendedor": "emprendedor",
    "riasec_convencional": "convencional",
    "big_five_apertura": "apertura",
    "big_five_responsabilidad": "responsabilidad",
    "big_five_extraversion": "extraversion",
    "big_five_amabilidad": "amabilidad",
    "big_five_neuroticismo": "neuroticismo",
    "incertidumbre_vocacional": "incertidumbre",
    "presion_externa": "presion",
    "tolerancia_dificultad": "tolerancia",
}

SECONDARY_ROUTES = {
    "ingenieria-tecnologia": ["ciencia-datos-investigacion", "administracion-finanzas"],
    "ciencia-datos-investigacion": ["ingenieria-tecnologia", "administracion-finanzas"],
    "salud-apoyo-humano": ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
    "educacion-ciencias-sociales": ["salud-apoyo-humano", "arte-comunicacion-diseno"],
    "arte-comunicacion-diseno": ["educacion-ciencias-sociales", "negocios-gestion"],
    "negocios-gestion": ["administracion-finanzas", "educacion-ciencias-sociales"],
    "administracion-finanzas": ["negocios-gestion", "ciencia-datos-investigacion"],
}

OPEN_TEXT_BY_PROFILE = {
    "ciencia-datos-investigacion": [
        "me interesa revisar informacion, comparar evidencias y encontrar patrones antes de decidir",
        "me motiva investigar problemas y explicar por que ocurren con datos o pruebas",
    ],
    "salud-apoyo-humano": [
        "me interesa acompanar a personas, escuchar con calma y entender que necesitan",
        "me motiva ayudar en temas de bienestar y sostener procesos de apoyo humano",
    ],
    "educacion-ciencias-sociales": [
        "me gusta explicar temas, orientar a otros y participar en actividades con impacto social",
        "me interesa comprender grupos humanos y ayudar a que otras personas aprendan mejor",
    ],
    "arte-comunicacion-diseno": [
        "me interesa crear piezas visuales, comunicar ideas y probar formas distintas de expresion",
        "me motiva disenar, imaginar soluciones y transformar ideas en propuestas concretas",
    ],
    "negocios-gestion": [
        "me interesa organizar proyectos, coordinar personas y tomar decisiones para avanzar",
        "me motiva liderar ideas, negociar alternativas y evaluar si un proyecto es viable",
    ],
    "administracion-finanzas": [
        "me siento comodo ordenando informacion, revisando detalles y siguiendo procesos claros",
        "me interesa gestionar recursos, presupuestos y tareas que requieren precision",
    ],
}


@dataclass(frozen=True)
class SyntheticConfig:
    include_zero_count_profiles: bool
    target_per_class: int | None
    total_rows: int | None
    seed: int


def bounded_score(value: float) -> float:
    return round(float(np.clip(value, 1.0, 5.0)) * 2) / 2


def build_target_counts(dataset: pd.DataFrame, config: SyntheticConfig) -> dict[str, int]:
    observed_counts = dataset["final_profile_code"].value_counts().to_dict()

    if config.total_rows is not None:
        if config.total_rows == DEFAULT_TOTAL_ROWS and not config.include_zero_count_profiles:
            target_counts = {}
            for profile, target_count in DEFAULT_ORGANIC_TARGET_DISTRIBUTION.items():
                if observed_counts.get(profile, 0) == 0:
                    continue
                target_counts[profile] = max(0, target_count - observed_counts.get(profile, 0))

            synthetic_total = sum(target_counts.values())
            expected_synthetic_total = config.total_rows - len(dataset)
            if synthetic_total != expected_synthetic_total:
                raise ValueError(
                    "Configured organic target distribution does not match requested total rows. "
                    f"synthetic_total={synthetic_total}, expected={expected_synthetic_total}."
                )

            return target_counts

        profiles = PRIORITY_PROFILES.copy()
        if not config.include_zero_count_profiles:
            profiles = [profile for profile in profiles if observed_counts.get(profile, 0) > 0]

        synthetic_total = config.total_rows - len(dataset)
        if synthetic_total < 0:
            raise ValueError(
                f"total_rows={config.total_rows} is lower than the real dataset size ({len(dataset)})."
            )

        target_counts = {profile: 0 for profile in profiles}
        running_counts = {profile: observed_counts.get(profile, 0) for profile in profiles}

        for _ in range(synthetic_total):
            selected_profile = min(
                profiles,
                key=lambda profile: (running_counts[profile], PRIORITY_PROFILES.index(profile)),
            )
            target_counts[selected_profile] += 1
            running_counts[selected_profile] += 1

        return target_counts

    profiles = list(PROFILE_NAMES)
    if not config.include_zero_count_profiles:
        profiles = [profile for profile in profiles if observed_counts.get(profile, 0) > 0]

    inferred_target = max(MIN_CLASS_TARGET, max(observed_counts.values()))
    inferred_target = min(inferred_target, MAX_CLASS_TARGET_CAP)
    target = config.target_per_class or inferred_target

    return {profile: max(0, target - observed_counts.get(profile, 0)) for profile in profiles}


def profile_center(dataset: pd.DataFrame, profile_code: str) -> dict[str, float]:
    rows = dataset[dataset["final_profile_code"] == profile_code]
    prototype = PROFILE_PROTOTYPES[profile_code]

    if rows.empty:
        return prototype.copy()

    empirical_weight = min(0.55, max(0.10, len(rows) / 20))
    center: dict[str, float] = {}
    for column in SCORE_COLUMNS:
        empirical_mean = float(rows[column].mean())
        prototype_value = prototype[column]
        center[column] = empirical_weight * empirical_mean + (1 - empirical_weight) * prototype_value

    return center


def synthesize_scores(
    center: dict[str, float],
    profile_code: str,
    rng: np.random.Generator,
    existing_rows: pd.DataFrame,
) -> dict[str, float]:
    if existing_rows.empty:
        base = center.copy()
    else:
        anchor = existing_rows.sample(1, random_state=int(rng.integers(0, 1_000_000))).iloc[0]
        anchor_weight = min(0.35, len(existing_rows) / 30)
        base = {
            column: anchor_weight * float(anchor[column]) + (1 - anchor_weight) * center[column]
            for column in SCORE_COLUMNS
        }

    scores = {
        column: bounded_score(value + rng.normal(0, 0.35))
        for column, value in base.items()
    }

    apply_profile_constraints(scores, profile_code, rng)
    apply_psychological_consistency(scores)

    return scores


def apply_profile_constraints(scores: dict[str, float], profile_code: str, rng: np.random.Generator) -> None:
    primary_columns = {
        "ingenieria-tecnologia": ["riasec_realista", "riasec_investigativo"],
        "ciencia-datos-investigacion": ["riasec_investigativo"],
        "salud-apoyo-humano": ["riasec_social", "big_five_amabilidad"],
        "educacion-ciencias-sociales": ["riasec_social", "big_five_extraversion"],
        "arte-comunicacion-diseno": ["riasec_artistico", "big_five_apertura"],
        "negocios-gestion": ["riasec_emprendedor", "big_five_extraversion"],
        "administracion-finanzas": ["riasec_convencional", "big_five_responsabilidad"],
    }[profile_code]

    for column in primary_columns:
        scores[column] = max(scores[column], bounded_score(4.0 + rng.normal(0.25, 0.25)))

    if profile_code == "arte-comunicacion-diseno":
        scores["riasec_convencional"] = min(scores["riasec_convencional"], 3.5)
    if profile_code == "administracion-finanzas":
        scores["riasec_artistico"] = min(scores["riasec_artistico"], 3.0)
    if profile_code == "ciencia-datos-investigacion":
        scores["big_five_apertura"] = max(scores["big_five_apertura"], 3.5)
    if profile_code == "salud-apoyo-humano":
        scores["riasec_social"] = max(scores["riasec_social"], scores["riasec_emprendedor"])


def apply_psychological_consistency(scores: dict[str, float]) -> None:
    if scores["big_five_responsabilidad"] >= 4:
        scores["tolerancia_dificultad"] = max(scores["tolerancia_dificultad"], 3.5)

    if scores["big_five_neuroticismo"] >= 4:
        scores["incertidumbre_vocacional"] = max(scores["incertidumbre_vocacional"], 3.0)

    if scores["presion_externa"] >= 4:
        scores["incertidumbre_vocacional"] = max(scores["incertidumbre_vocacional"], 2.5)

    if scores["incertidumbre_vocacional"] <= 2:
        scores["big_five_neuroticismo"] = min(scores["big_five_neuroticismo"], 3.5)

    for column in SCORE_COLUMNS:
        scores[column] = bounded_score(scores[column])


def build_likert_answers(scores: dict[str, float], rng: np.random.Generator) -> str:
    answers = []
    for order, (question_id, score_column) in enumerate(QUESTION_PLAN, start=1):
        value = int(np.clip(round(scores[score_column] + rng.normal(0, 0.35)), 1, 5))
        answers.append(
            {
                "question_id": question_id,
                "dimension": DIMENSION_BY_COLUMN[score_column],
                "value": value,
                "question_order": order,
                "answered_at": None,
            }
        )

    return json.dumps(answers, ensure_ascii=False)


def compatible_routes(profile_code: str, rng: np.random.Generator) -> tuple[str, str]:
    routes = SECONDARY_ROUTES[profile_code].copy()
    rng.shuffle(routes)
    selected = routes[: int(rng.integers(1, min(3, len(routes)) + 1))]
    return (
        ",".join(selected),
        " | ".join(PROFILE_NAMES[route] for route in selected),
    )


def build_synthetic_row(
    dataset: pd.DataFrame,
    profile_code: str,
    index: int,
    rng: np.random.Generator,
) -> dict[str, object]:
    center = profile_center(dataset, profile_code)
    existing_rows = dataset[dataset["final_profile_code"] == profile_code]
    scores = synthesize_scores(center, profile_code, rng, existing_rows)
    created_at = datetime(2026, 5, 27, 12, 0, 0) + timedelta(minutes=index)
    route_codes, route_names = compatible_routes(profile_code, rng)
    open_text_options = OPEN_TEXT_BY_PROFILE.get(profile_code, ["respuesta sintetica coherente con el perfil"])
    open_text = open_text_options[index % len(open_text_options)]
    confidence = bounded_score(3.7 + rng.normal(0, 0.35)) * 20

    row = {
        "session_id": f"synthetic-{uuid.uuid4()}",
        "anonymous_participant_id": f"SYN-{profile_code[:3].upper()}-{index:04d}",
        "created_at": created_at.isoformat(timespec="seconds"),
        "finished_at": (created_at + timedelta(minutes=int(rng.integers(6, 15)))).isoformat(timespec="seconds"),
        "session_status": "COMPLETED",
        "total_questions": len(QUESTION_PLAN),
        "final_profile_code": profile_code,
        "final_profile_name": PROFILE_NAMES[profile_code],
        "predicted_profile_code": profile_code,
        "predicted_profile_name": PROFILE_NAMES[profile_code],
        "confidence_score": round(float(np.clip(confidence, 35, 92)), 2),
        "model_used": "synthetic-riasec-big-five-v1",
        **scores,
        "likert_answer_count": len(QUESTION_PLAN),
        "open_answer_count": 1,
        "likert_answers_json": build_likert_answers(scores, rng),
        "open_answers_text": open_text,
        "open_answers_json": json.dumps(
            [
                {
                    "question_id": 104,
                    "trigger": "motivation",
                    "answer_text": open_text,
                    "answer_order": len(QUESTION_PLAN) + 1,
                    "answered_at": None,
                }
            ],
            ensure_ascii=False,
        ),
        "compatible_route_codes": route_codes,
        "compatible_route_names": route_names,
        "is_synthetic": True,
        "synthetic_strategy": (
            "profile_prototype_with_empirical_anchor"
            if not existing_rows.empty
            else "synthetic_only_class_profile_prototype"
        ),
    }

    return row


def generate_balanced_dataset(
    input_path: Path = PROCESSED_DATASET_PATH,
    output_path: Path = BALANCED_DATASET_PATH,
    report_path: Path = SYNTHETIC_REPORT_PATH,
    config: SyntheticConfig = SyntheticConfig(
        include_zero_count_profiles=False,
        target_per_class=None,
        total_rows=DEFAULT_TOTAL_ROWS,
        seed=RANDOM_SEED,
    ),
) -> pd.DataFrame:
    dataset = pd.read_csv(input_path)
    dataset["is_synthetic"] = False
    dataset["synthetic_strategy"] = "observed"

    rng = np.random.default_rng(config.seed)
    target_counts = build_target_counts(dataset, config)
    synthetic_rows: list[dict[str, object]] = []

    synthetic_index = 1
    for profile_code, needed_count in target_counts.items():
        for _ in range(needed_count):
            synthetic_rows.append(build_synthetic_row(dataset, profile_code, synthetic_index, rng))
            synthetic_index += 1

    synthetic_dataset = pd.DataFrame(synthetic_rows)
    balanced = pd.concat([dataset, synthetic_dataset], ignore_index=True)
    balanced = balanced.sort_values(["final_profile_code", "is_synthetic"]).reset_index(drop=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    balanced.to_csv(output_path, index=False, encoding="utf-8")
    write_synthetic_report(dataset, synthetic_dataset, balanced, report_path)

    return balanced


def write_synthetic_report(
    original: pd.DataFrame,
    synthetic: pd.DataFrame,
    balanced: pd.DataFrame,
    report_path: Path,
) -> None:
    synthetic_percentage = len(synthetic) / max(1, len(balanced))
    distribution = balanced["final_profile_code"].value_counts().sort_index()
    report_lines = [
        "Reporte de datos sinteticos - Dataset experimental 100",
        "=" * 62,
        f"Total de registros reales: {len(original)}",
        f"Total de registros sinteticos: {len(synthetic)}",
        f"Porcentaje sintetico: {synthetic_percentage:.1%}",
        f"Total de registros finales: {len(balanced)}",
        "",
        "Distribucion final por perfil:",
    ]

    report_lines.extend(
        f"- {profile}: {count} ({count / max(1, len(balanced)):.1%})"
        for profile, count in distribution.items()
    )

    report_lines.extend([
        "",
        "Distribucion real vs sintetica:",
    ])

    summary = (
        balanced.groupby(["final_profile_code", "is_synthetic"])
        .size()
        .unstack(fill_value=0)
        .rename(columns={False: "real", True: "synthetic"})
    )
    for profile_code, row in summary.iterrows():
        report_lines.append(
            f"- {profile_code}: real={int(row.get('real', 0))}, synthetic={int(row.get('synthetic', 0))}"
        )

    report_lines.extend([
        "",
        "Advertencias:",
        "- Este dataset es experimental y sirve para entrenamiento inicial, pruebas de pipeline y validacion de comportamiento del modelo.",
        "- Los datos sinteticos no reemplazan datos reales; deben sustituirse progresivamente con nuevas respuestas observadas.",
        "- El balanceo es parcial y organico: Ingenieria se mantiene como clase mayoritaria real y las clases minoritarias conservan tamanos diferentes.",
        "- Se priorizo coherencia psicologica sobre balance perfecto.",
    ])

    if not synthetic.empty and (
        synthetic["synthetic_strategy"] == "synthetic_only_class_profile_prototype"
    ).any():
        report_lines.append(
            "- Hay clases sinteticas sin ejemplos reales. Deben excluirse del entrenamiento principal o tratarse como exploratorias."
        )

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a balanced experimental synthetic dataset.")
    parser.add_argument("--input", type=Path, default=PROCESSED_DATASET_PATH)
    parser.add_argument("--output", type=Path, default=BALANCED_DATASET_PATH)
    parser.add_argument("--report", type=Path, default=SYNTHETIC_REPORT_PATH)
    parser.add_argument("--target-per-class", type=int, default=None)
    parser.add_argument("--total-rows", type=int, default=DEFAULT_TOTAL_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    parser.add_argument(
        "--include-zero-count-profiles",
        action="store_true",
        help="Allow generation for profiles with no real examples. These rows are clearly marked as synthetic-only.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = SyntheticConfig(
        include_zero_count_profiles=args.include_zero_count_profiles,
        target_per_class=args.target_per_class,
        total_rows=None if args.target_per_class is not None else args.total_rows,
        seed=args.seed,
    )
    balanced = generate_balanced_dataset(args.input, args.output, args.report, config)
    synthetic_count = int(balanced["is_synthetic"].sum())

    print("Synthetic balancing completed.")
    print(f"Total rows: {len(balanced)}")
    print(f"Synthetic rows: {synthetic_count}")
    print(f"Output dataset: {args.output}")
    print(f"Report: {args.report}")


if __name__ == "__main__":
    main()
