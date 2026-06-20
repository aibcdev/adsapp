#!/usr/bin/env python3
"""Generate high-quality Chrome Web Store screenshots and promo tiles for AIBC."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path.home() / "Desktop" / "aibc-chrome-store-assets"
HD = OUT / "hd"
OUT.mkdir(parents=True, exist_ok=True)
HD.mkdir(parents=True, exist_ok=True)

# Render at 4x then downscale for crisp edges and text.
SUPERSAMPLE = 4

WHITE = (255, 255, 255)
BLACK = (17, 17, 17)
ZINC_600 = (82, 82, 91)
ZINC_200 = (228, 228, 231)
ZINC_100 = (244, 244, 245)
EMERALD = (5, 150, 105)
EMERALD_LIGHT = (236, 253, 245)
EMERALD_DARK = (4, 120, 87)
SHADOW = (0, 0, 0, 38)

FONT_REG = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_DISPLAY = "/System/Library/Fonts/Avenir Next.ttc"


def font(size: int, bold: bool = False, display: bool = False) -> ImageFont.FreeTypeFont:
    size = int(size * SUPERSAMPLE)
    paths: list[tuple[str, int]] = []
    if display:
        paths.append((FONT_DISPLAY, 0))
    if bold:
        paths.extend([(FONT_BOLD, 0), (FONT_REG, 1), (FONT_DISPLAY, 1)])
    else:
        paths.extend([(FONT_REG, 0), (FONT_DISPLAY, 0)])
    for path, index in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=index)
            except OSError:
                try:
                    return ImageFont.truetype(path, size)
                except OSError:
                    continue
    return ImageFont.load_default()


def s(v: float | int) -> int:
    return int(v * SUPERSAMPLE)


def canvas(size: tuple[int, int], color) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    w, h = size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE
    img = Image.new("RGBA", (w, h), color if len(color) == 4 else (*color, 255))
    return img, ImageDraw.Draw(img)


def finish(img: Image.Image, target: tuple[int, int]) -> Image.Image:
    rgb = img.convert("RGB") if img.mode == "RGBA" else img
    down = rgb.resize(target, Image.Resampling.LANCZOS)
    sharp = down.filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=2))
    return sharp


def gradient_bg(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        row = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = row
    return img


def add_shadow(base: Image.Image, layer: Image.Image, xy: tuple[int, int], blur: int = 18, offset: int = 8) -> Image.Image:
    out = base.copy()
    if layer.mode == "RGBA":
        mask = layer.split()[-1]
        shadow = Image.new("RGBA", layer.size, SHADOW)
        shadow.putalpha(mask)
    else:
        shadow = Image.new("RGBA", layer.size, SHADOW)
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(1, s(blur) // SUPERSAMPLE)))
    out.alpha_composite(shadow, (xy[0] + s(offset), xy[1] + s(offset)))
    if layer.mode != "RGBA":
        layer = layer.convert("RGBA")
    out.alpha_composite(layer, xy)
    return out


def rounded_rect_rgba(w: int, h: int, radius: int, fill: tuple[int, ...], outline: tuple[int, ...] | None = None, width: int = 1) -> Image.Image:
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=fill, outline=outline, width=max(1, s(width)))
    return img


def draw_logo(draw: ImageDraw.ImageDraw, cx: int, cy: int, outer: int = 28) -> None:
    outer = s(outer)
    draw.ellipse((cx - outer, cy - outer, cx + outer, cy + outer), fill=BLACK)
    mid = int(outer * 0.64)
    draw.ellipse((cx - mid, cy - mid, cx + mid, cy + mid), fill=WHITE)
    inner = int(outer * 0.25)
    draw.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill=BLACK)


def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textlength(test, font=fnt) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def chrome_topbar(draw, width, title="Claude", top=56):
    top = s(top)
    draw.rounded_rectangle((0, top, width, top + s(56)), radius=0, fill=(243, 244, 246))
    for i, c in enumerate([(239, 68, 68), (250, 204, 21), (34, 197, 94)]):
        r = s(8)
        draw.ellipse((s(18 + i * 22), top + s(18), s(18 + i * 22) + r * 2, top + s(18) + r * 2), fill=c)
    fnt = font(14)
    tw = draw.textlength(title, font=fnt)
    draw.text(((width - tw) / 2, top + s(18)), title, font=fnt, fill=BLACK)


def side_panel_layer(w: int, h: int, earnings="$42.18") -> Image.Image:
    panel = rounded_rect_rgba(w, h, s(16), WHITE, ZINC_200, 2)
    draw = ImageDraw.Draw(panel)
    draw_logo(draw, s(28), s(34), 16)
    draw.text((s(52), s(24)), "ads by aibc", font=font(16, True), fill=BLACK)
    draw.rounded_rectangle((s(16), s(64), w - s(16), s(150)), radius=s(12), fill=EMERALD_LIGHT)
    draw.text((s(28), s(82)), "Today's earnings", font=font(13), fill=ZINC_600)
    draw.text((s(28), s(108)), earnings, font=font(34, True, display=True), fill=EMERALD_DARK)
    draw.text((s(28), s(178)), "60% revenue share", font=font(13, True), fill=EMERALD)
    draw.text((s(28), s(210)), "Impressions: 128", font=font(12), fill=ZINC_600)
    draw.text((s(28), s(232)), "Pending payout: $18.40", font=font(12), fill=ZINC_600)
    draw.rounded_rectangle((s(16), h - s(56), w - s(16), h - s(16)), radius=s(10), fill=BLACK)
    draw.text((s(52), h - s(42)), "Open dashboard", font=font(13, True), fill=WHITE)
    return panel


def screenshot_1_hero() -> Image.Image:
    size = (1280, 800)
    base = gradient_bg(size, (252, 252, 253), (244, 244, 246)).convert("RGBA")
    draw = ImageDraw.Draw(base)
    draw.text((s(60), s(28)), "Earn whilst you prompt", font=font(38, True, display=True), fill=BLACK)
    chrome_topbar(draw, base.size[0], "ChatGPT", top=72)

    card = rounded_rect_rgba(s(860), s(630), s(20), WHITE, ZINC_200, 2)
    card_draw = ImageDraw.Draw(card)
    card_draw.text((s(32), s(38)), "You", font=font(14, True), fill=BLACK)
    card_draw.text((s(32), s(68)), "Build a React dashboard with auth", font=font(18), fill=BLACK)
    card_draw.text((s(32), s(148)), "ChatGPT is thinking…", font=font(16), fill=ZINC_600)
    card_draw.rounded_rectangle((s(32), s(188), s(780), s(238)), radius=s(10), fill=ZINC_100, outline=ZINC_200, width=1)
    card_draw.text((s(52), s(204)), "Sponsored · Deploy Postgres in 60s —", font=font(15), fill=EMERALD)
    card_draw.text((s(52), s(226)), "get 60% back to you via aibc", font=font(13), fill=ZINC_600)
    base = add_shadow(base, card, (s(40), s(120)))

    panel = side_panel_layer(s(300), s(630))
    base = add_shadow(base, panel, (s(940), s(120)))
    return finish(base, size)


def screenshot_2_platforms() -> Image.Image:
    size = (1280, 800)
    base = gradient_bg(size, (255, 255, 255), (250, 250, 252)).convert("RGBA")
    draw = ImageDraw.Draw(base)
    draw_logo(draw, s(80), s(80), 24)
    draw.text((s(120), s(58)), "ads by aibc", font=font(28, True, display=True), fill=BLACK)
    draw.text((s(80), s(130)), "Works on the AI tools you already use", font=font(40, True, display=True), fill=BLACK)

    platforms = ["ChatGPT", "Claude", "Gemini", "Lovable", "v0", "Replit"]
    x0, y0 = s(80), s(230)
    for i, name in enumerate(platforms):
        col, row = i % 3, i // 3
        px, py = x0 + col * s(380), y0 + row * s(150)
        tile = rounded_rect_rgba(s(340), s(110), s(18), (249, 250, 251), ZINC_200, 2)
        td = ImageDraw.Draw(tile)
        tw = td.textlength(name, font=font(28, True, display=True))
        td.text(((s(340) - tw) / 2, s(40)), name, font=font(28, True, display=True), fill=BLACK)
        base = add_shadow(base, tile, (px, py), blur=12, offset=5)

    draw.text((s(80), s(560)), "Developer-focused ads during natural wait moments.", font=font(24), fill=ZINC_600)
    draw.text((s(80), s(610)), "No pop-ups. No reading your prompts.", font=font(24), fill=ZINC_600)
    cta = rounded_rect_rgba(s(340), s(60), s(12), EMERALD)
    ctd = ImageDraw.Draw(cta)
    ctd.text((s(30), s(18)), "Install free · aibcmedia.com", font=font(20, True), fill=WHITE)
    base = add_shadow(base, cta, (s(80), s(680)), blur=10, offset=4)
    return finish(base, size)


def screenshot_3_dashboard() -> Image.Image:
    size = (1280, 800)
    base = gradient_bg(size, (248, 250, 252), (241, 245, 249)).convert("RGBA")
    draw = ImageDraw.Draw(base)
    chrome_topbar(draw, base.size[0], "aibcmedia.com/dashboard")

    shell = rounded_rect_rgba(s(1160), s(650), s(20), WHITE, ZINC_200, 2)
    sd = ImageDraw.Draw(shell)
    sd.text((s(40), s(30)), "Developer dashboard", font=font(34, True, display=True), fill=BLACK)
    cards = [
        ("Today", "$6.42", EMERALD_LIGHT),
        ("This month", "$42.18", (239, 246, 255)),
        ("Lifetime", "$318.90", (255, 247, 237)),
        ("Pending", "$18.40", (250, 245, 255)),
    ]
    cx = s(40)
    for label, value, bg in cards:
        card = rounded_rect_rgba(s(250), s(130), s(14), bg, ZINC_200, 1)
        cd = ImageDraw.Draw(card)
        cd.text((s(24), s(24)), label, font=font(14), fill=ZINC_600)
        cd.text((s(24), s(54)), value, font=font(32, True, display=True), fill=BLACK)
        shell.alpha_composite(card, (cx, s(100)))
        cx += s(280)

    info = rounded_rect_rgba(s(1080), s(160), s(14), (249, 250, 251), ZINC_200, 1)
    idraw = ImageDraw.Draw(info)
    idraw.text((s(30), s(30)), "Transparent yield", font=font(20, True), fill=BLACK)
    idraw.text((s(30), s(70)), "$0.84 / agent-hour · 60% paid to you", font=font(18), fill=ZINC_600)
    idraw.text((s(30), s(110)), "Stripe payouts from $10 minimum", font=font(18), fill=ZINC_600)
    shell.alpha_composite(info, (s(40), s(270)))
    sd.text((s(40), s(470)), "Track earnings in real time from Chrome side panel", font=font(26, True), fill=BLACK)
    base = add_shadow(base, shell, (s(60), s(90)))
    return finish(base, size)


def screenshot_4_privacy() -> Image.Image:
    size = (1280, 800)
    base = Image.new("RGBA", (s(1280), s(800)), (255, 255, 255, 255))
    panel = rounded_rect_rgba(s(1040), s(600), s(24), EMERALD_LIGHT, EMERALD, 3)
    draw = ImageDraw.Draw(panel)
    draw.text((s(60), s(60)), "Privacy first", font=font(22, True), fill=EMERALD_DARK)
    draw.text((s(60), s(120)), "We never read your prompts", font=font(44, True, display=True), fill=BLACK)
    bullets = [
        "✓  No access to AI conversation content",
        "✓  No browsing history tracking",
        "✓  No source code collection",
        "✓  Only aibcmedia.com + API for sign-in & payouts",
    ]
    y = s(220)
    for line in bullets:
        draw.text((s(80), y), line, font=font(26), fill=BLACK)
        y += s(56)
    draw.text((s(60), s(480)), "Full policy: aibcmedia.com/privacy", font=font(20), fill=ZINC_600)
    base = add_shadow(base, panel, (s(120), s(100)))
    return finish(base, size)


def screenshot_5_how_it_works() -> Image.Image:
    size = (1280, 800)
    base = gradient_bg(size, (24, 24, 24), (10, 10, 10)).convert("RGBA")
    draw = ImageDraw.Draw(base)
    draw.text((s(80), s(70)), "How it works", font=font(44, True, display=True), fill=WHITE)
    steps = [
        ("1", "Install", "Add ads by aibc from Chrome Web Store"),
        ("2", "Sign in", "Connect with Google at aibcmedia.com"),
        ("3", "Use AI as normal", "See relevant dev-tool ads while you wait"),
        ("4", "Get paid", "Keep 60% — cash out via Stripe"),
    ]
    x = s(80)
    for num, title, body in steps:
        step = rounded_rect_rgba(s(260), s(440), s(18), (38, 38, 38))
        sd = ImageDraw.Draw(step)
        sd.rounded_rectangle((s(24), s(30), s(72), s(78)), radius=s(12), fill=EMERALD)
        sd.text((s(40), s(38)), num, font=font(22, True), fill=WHITE)
        sd.text((s(24), s(100)), title, font=font(24, True), fill=WHITE)
        for i, line in enumerate(wrap_text(sd, body, font(16), s(210))):
            sd.text((s(24), s(160) + i * s(28)), line, font=font(16), fill=(212, 212, 216))
        base = add_shadow(base, step, (x, s(180)), blur=14, offset=6)
        x += s(290)
    draw.text((s(80), s(700)), "aibcmedia.com", font=font(22, True), fill=EMERALD)
    return finish(base, size)


def promo_small() -> Image.Image:
    size = (440, 280)
    base = gradient_bg(size, (6, 168, 118), EMERALD_DARK).convert("RGBA")
    draw = ImageDraw.Draw(base)
    draw_logo(draw, s(56), s(70), 30)
    draw.text((s(100), s(44)), "ads by aibc", font=font(24, True, display=True), fill=WHITE)
    draw.text((s(40), s(120)), "Earn whilst", font=font(30, True, display=True), fill=WHITE)
    draw.text((s(40), s(158)), "you prompt", font=font(30, True, display=True), fill=WHITE)
    draw.text((s(40), s(220)), "60% to developers", font=font(16), fill=(220, 252, 231))
    return finish(base, size)


def promo_marquee() -> Image.Image:
    size = (1400, 560)
    base = gradient_bg(size, (20, 20, 20), (8, 8, 8)).convert("RGBA")
    draw = ImageDraw.Draw(base)
    draw_logo(draw, s(120), s(180), 52)
    draw.text((s(200), s(120)), "ads by aibc", font=font(48, True, display=True), fill=WHITE)
    draw.text((s(120), s(260)), "Get paid while AI thinks.", font=font(56, True, display=True), fill=WHITE)
    draw.text((s(120), s(340)), "Developer ads · 60% revenue share · Privacy-first", font=font(28), fill=(212, 212, 216))
    cta = rounded_rect_rgba(s(300), s(70), s(14), EMERALD)
    ctd = ImageDraw.Draw(cta)
    ctd.text((s(30), s(20)), "Install free", font=font(26, True), fill=WHITE)
    base.alpha_composite(cta, (s(120), s(420)))

    frame = rounded_rect_rgba(s(440), s(400), s(20), (38, 38, 38))
    panel = side_panel_layer(s(280), s(340))
    frame.alpha_composite(panel, (s(30), s(30)))
    base = add_shadow(base, frame, (s(900), s(80)))
    return finish(base, size)


def save_assets(img: Image.Image, name: str, store_size: tuple[int, int]) -> None:
    store_path = OUT / name
    img.save(store_path, format="PNG", compress_level=1)

    hd_w, hd_h = store_size[0] * 2, store_size[1] * 2
    hd_img = img.resize((hd_w, hd_h), Image.Resampling.LANCZOS)
    hd_img = hd_img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=2))
    hd_path = HD / name.replace(".png", f"-{hd_w}x{hd_h}.png")
    hd_img.save(hd_path, format="PNG", compress_level=1)
    print(f"  store {store_path} ({img.size[0]}x{img.size[1]})")
    print(f"  hd    {hd_path} ({hd_w}x{hd_h})")


def main() -> None:
    shots = [
        ("screenshot-1-hero-1280x800.png", screenshot_1_hero, (1280, 800)),
        ("screenshot-2-platforms-1280x800.png", screenshot_2_platforms, (1280, 800)),
        ("screenshot-3-dashboard-1280x800.png", screenshot_3_dashboard, (1280, 800)),
        ("screenshot-4-privacy-1280x800.png", screenshot_4_privacy, (1280, 800)),
        ("screenshot-5-how-it-works-1280x800.png", screenshot_5_how_it_works, (1280, 800)),
        ("promo-small-440x280.png", promo_small, (440, 280)),
        ("promo-marquee-1400x560.png", promo_marquee, (1400, 560)),
    ]
    print(f"Rendering at {SUPERSAMPLE}x supersample → {OUT}\n")
    for name, fn, size in shots:
        img = fn()
        assert img.size == size, f"bad size {img.size} for {name}"
        save_assets(img, name, size)
    print("\nDone.")


if __name__ == "__main__":
    main()
