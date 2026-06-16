#!/usr/bin/env python3
"""Generate favicon PNGs and og-image for aibcmedia.com from the AIBC bullseye logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "packages" / "portal" / "public"
OUT.mkdir(parents=True, exist_ok=True)

WHITE = (255, 255, 255)
BLACK = (17, 17, 17)
ZINC_600 = (82, 82, 91)
EMERALD = (5, 150, 105)

FONT_REG = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_DISPLAY = "/System/Library/Fonts/Avenir Next.ttc"


def load_font(size: int, bold: bool = False, display: bool = False) -> ImageFont.FreeTypeFont:
    paths: list[tuple[str, int]] = []
    if display:
        paths.append((FONT_DISPLAY, 0))
    if bold:
        paths.extend([(FONT_BOLD, 0), (FONT_REG, 1)])
    else:
        paths.extend([(FONT_REG, 0), (FONT_DISPLAY, 0)])
    for path, index in paths:
        try:
            return ImageFont.truetype(path, size, index=index)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_bullseye(size: int, padding: float = 0.08) -> Image.Image:
    img = Image.new("RGBA", (size, size), WHITE + (255,))
    draw = ImageDraw.Draw(img)
    inset = int(size * padding)
    box = (inset, inset, size - inset - 1, size - inset - 1)
    draw.ellipse(box, fill=BLACK)
    inner = int(size * 0.28)
    draw.ellipse((inner, inner, size - inner - 1, size - inner - 1), fill=WHITE)
    dot = int(size * 0.11)
    center = size // 2
    draw.ellipse(
        (center - dot, center - dot, center + dot - 1, center + dot - 1),
        fill=BLACK,
    )
    return img


def save_icon(size: int, name: str) -> None:
    img = draw_bullseye(size)
    img.save(OUT / name, format="PNG", optimize=True)


def save_og_image() -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    logo = draw_bullseye(180).convert("RGB")
    img.paste(logo, (96, (h - 180) // 2))

    title_font = load_font(72, bold=True, display=True)
    tag_font = load_font(34)
    url_font = load_font(28)

    draw.text((320, 210), "AIBC", fill=BLACK, font=title_font)
    draw.text((320, 300), "Make money whilst you code", fill=ZINC_600, font=tag_font)
    draw.text((320, 370), "70% developer share · VS Code, Cursor, Claude", fill=EMERALD, font=tag_font)
    draw.text((96, h - 72), "aibcmedia.com", fill=ZINC_600, font=url_font)

    img.save(OUT / "og-image.png", format="PNG", optimize=True)


def save_favicon_ico() -> None:
    sizes = [16, 32, 48]
    images = [draw_bullseye(size).convert("RGBA") for size in sizes]
    images[0].save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )


def main() -> None:
    save_icon(16, "favicon-16x16.png")
    save_icon(32, "favicon-32x32.png")
    save_icon(180, "apple-touch-icon.png")
    save_icon(192, "icon-192.png")
    save_icon(512, "icon-512.png")
    save_favicon_ico()
    save_og_image()
    print(f"[site-assets] favicons + og-image → {OUT}")


if __name__ == "__main__":
    main()
