from __future__ import annotations

import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"
OUTPUT_PATH = OUTPUT_DIR / "crisp_dm_orientacion_vocacional.png"

W, H = 4800, 2700
BG = "#f7f8fb"
INK = "#172033"
MUTED = "#52606d"
ARROW = "#6b7280"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


TITLE = font(78, True)
SUBTITLE = font(38)
BOX_TITLE = font(40, True)
BOX_BODY = font(34)
BOX_BODY_SMALL = font(31)
BADGE_FONT = font(42, True)
CENTER_TITLE = font(48, True)
CENTER_BODY = font(36)
FOOTER = font(30)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=8)
    return box[2] - box[0], box[3] - box[1]


def wrap_to_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_width: int) -> str:
    lines: list[str] = []
    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if not stripped:
            lines.append("")
            continue
        is_bullet = stripped.startswith("- ")
        prefix = "- " if is_bullet else ""
        indent = "  " if is_bullet else ""
        content = stripped[2:] if is_bullet else stripped
        words = content.split()
        current = ""
        for word in words:
            trial = word if not current else f"{current} {word}"
            trial_text = prefix + trial if not current or prefix else trial
            if draw.textbbox((0, 0), trial_text, font=fnt)[2] <= max_width:
                current = trial
            else:
                if current:
                    lines.append(prefix + current)
                    prefix = indent
                current = word
        if current:
            lines.append(prefix + current)
    return "\n".join(lines)


def centered_multiline(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    text: str,
    fnt: ImageFont.ImageFont,
    fill: str,
    spacing: int = 8,
) -> None:
    x1, y1, x2, y2 = rect
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.multiline_text(
        (x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2),
        text,
        font=fnt,
        fill=fill,
        spacing=spacing,
        align="center",
    )


def add_box(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    number: int,
    title: str,
    body: str,
    fill: str,
    outline: str,
) -> None:
    x1, y1, x2, y2 = rect
    draw.rounded_rectangle(rect, radius=28, fill=fill, outline=outline, width=8)
    draw.rounded_rectangle((x1 + 54, y1 + 54, x1 + 174, y1 + 150), radius=14, fill=outline)
    centered_multiline(draw, (x1 + 54, y1 + 54, x1 + 174, y1 + 150), str(number), BADGE_FONT, "white")

    title_rect = (x1 + 50, y1 + 105, x2 - 50, y1 + 205)
    title_wrapped = wrap_to_width(draw, title, BOX_TITLE, x2 - x1 - 110)
    centered_multiline(draw, title_rect, title_wrapped, BOX_TITLE, INK, spacing=6)

    body_font = BOX_BODY_SMALL if "\n" in body else BOX_BODY
    body_wrapped = wrap_to_width(draw, body, body_font, x2 - x1 - 145)
    body_rect = (x1 + 70, y1 + 210, x2 - 70, y2 - 42)
    centered_multiline(draw, body_rect, body_wrapped, body_font, "#2f3a4a", spacing=10)


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], width: int = 8) -> None:
    draw.line((start, end), fill=ARROW, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 38
    p1 = end
    p2 = (end[0] - size * math.cos(angle - 0.45), end[1] - size * math.sin(angle - 0.45))
    p3 = (end[0] - size * math.cos(angle + 0.45), end[1] - size * math.sin(angle + 0.45))
    draw.polygon((p1, p2, p3), fill=ARROW)


def dashed_round_rect(draw: ImageDraw.ImageDraw, rect: tuple[int, int, int, int], radius: int, color: str) -> None:
    x1, y1, x2, y2 = rect
    dash, gap = 38, 24
    for x in range(x1 + radius, x2 - radius, dash + gap):
        draw.line((x, y1, min(x + dash, x2 - radius), y1), fill=color, width=6)
        draw.line((x, y2, min(x + dash, x2 - radius), y2), fill=color, width=6)
    for y in range(y1 + radius, y2 - radius, dash + gap):
        draw.line((x1, y, x1, min(y + dash, y2 - radius)), fill=color, width=6)
        draw.line((x2, y, x2, min(y + dash, y2 - radius)), fill=color, width=6)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    centered_multiline(
        draw,
        (250, 120, W - 250, 230),
        "CRISP-DM adaptado al proyecto de orientación vocacional inteligente",
        TITLE,
        "#14213d",
        spacing=4,
    )
    centered_multiline(
        draw,
        (420, 250, W - 420, 330),
        "Flujo metodológico para transformar respuestas psicométricas en recomendaciones vocacionales explicables",
        SUBTITLE,
        MUTED,
    )

    boxes = [
        ((250, 545, 1430, 965), 1, "Comprensión del problema", "Objetivo: apoyar la toma de decisiones vocacionales con evidencia del test.", "#eaf2ff", "#2563eb"),
        ((1810, 545, 2990, 965), 2, "Recolección de respuestas del test", "Aplicación del test y registro estructurado de respuestas del estudiante.", "#e9fbf5", "#059669"),
        ((3370, 545, 4550, 965), 3, "Limpieza y procesamiento de datos", "Validación, codificación, normalización y preparación del conjunto de datos.", "#fff7ed", "#ea580c"),
        ((3370, 1195, 4550, 1705), 4, "Feature Engineering", "- RIASEC\n- Big Five\n- incertidumbre vocacional\n- presión externa", "#f5f3ff", "#7c3aed"),
        ((3370, 1950, 4550, 2490), 5, "Entrenamiento de modelos", "- SVM\n- Random Forest\n- KNN\n- Decision Tree\n- Logistic Regression", "#eefdf8", "#0f766e"),
        ((2170, 1950, 3250, 2490), 6, "Evaluación", "- Accuracy\n- Precision\n- Recall\n- F1 Score", "#fff1f2", "#be123c"),
        ((1090, 1950, 2050, 2490), 7, "Generación de recomendaciones", "Carreras sugeridas y explicación basada en perfiles e indicadores.", "#f1f5f9", "#475569"),
        ((250, 1950, 970, 2490), 8, "Dashboard y PDF", "Visualización final, reporte descargable y soporte para interpretación.", "#fffbeb", "#ca8a04"),
    ]
    for spec in boxes:
        add_box(draw, *spec)

    center_rect = (1460, 1165, 3290, 1725)
    draw.rounded_rectangle(center_rect, radius=30, fill="#ffffff", outline="#94a3b8", width=1)
    dashed_round_rect(draw, center_rect, 30, "#94a3b8")
    centered_multiline(draw, (center_rect[0] + 80, 1250, center_rect[2] - 80, 1360), "Ciclo iterativo de mejora", CENTER_TITLE, "#14213d")
    centered_multiline(
        draw,
        (center_rect[0] + 120, 1390, center_rect[2] - 120, 1570),
        "Resultados de evaluación retroalimentan datos, variables y modelos",
        CENTER_BODY,
        "#475569",
        spacing=8,
    )

    arrow(draw, (1430, 755), (1810, 755))
    arrow(draw, (2990, 755), (3370, 755))
    arrow(draw, (3960, 965), (3960, 1195))
    arrow(draw, (3960, 1705), (3960, 1950))
    arrow(draw, (3370, 2220), (3250, 2220))
    arrow(draw, (2170, 2220), (2050, 2220))
    arrow(draw, (1090, 2220), (970, 2220))
    arrow(draw, (610, 1950), (610, 965))

    feedback_layer = Image.new("RGBA", (430, 72), (255, 255, 255, 0))
    feedback_draw = ImageDraw.Draw(feedback_layer)
    feedback_draw.text((215, 36), "retroalimentación", font=font(34), fill="#64748b", anchor="mm")
    img.paste(feedback_layer.rotate(90, expand=True), (330, 1210), feedback_layer.rotate(90, expand=True))

    centered_multiline(
        draw,
        (450, 2580, W - 450, 2645),
        "Fuente: elaboración propia basada en CRISP-DM, adaptada al sistema de orientación vocacional inteligente.",
        FOOTER,
        "#64748b",
    )

    img.save(OUTPUT_PATH, dpi=(300, 300))
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
