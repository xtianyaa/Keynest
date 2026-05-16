from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "src-tauri" / "icons"


def scale_points(points, factor):
    return [(round(x * factor), round(y * factor)) for x, y in points]


def draw_icon(size: int) -> Image.Image:
    factor = size / 256
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    hex_points = [(128, 18), (221, 69), (221, 187), (128, 238), (35, 187), (35, 69)]
    shadow = [(x, y + 10) for x, y in hex_points]
    draw.polygon(scale_points(shadow, factor), fill=(16, 32, 26, 44))
    draw.polygon(scale_points(hex_points, factor), fill=(47, 138, 112, 255), outline=(22, 79, 64, 255))

    inset = [(128, 34), (205, 77), (205, 179), (128, 222), (51, 179), (51, 77)]
    draw.line(scale_points(inset + [inset[0]], factor), fill=(84, 180, 150, 255), width=max(2, round(5 * factor)))

    white = (248, 251, 248, 255)
    graphite = (23, 38, 32, 255)
    mint = (215, 238, 229, 255)
    draw.ellipse(
        [round(84.5 * factor), round(68 * factor), round(171.5 * factor), round(155 * factor)],
        fill=white,
    )
    draw.rectangle(
        [round(108 * factor), round(121 * factor), round(148 * factor), round(184 * factor)],
        fill=white,
    )
    draw.ellipse(
        [round(113.3 * factor), round(94 * factor), round(142.7 * factor), round(123.4 * factor)],
        fill=graphite,
    )
    draw.rectangle(
        [round(119.7 * factor), round(114 * factor), round(136.3 * factor), round(142.6 * factor)],
        fill=graphite,
    )

    stroke = max(5, round(12 * factor))
    draw.line(scale_points([(75, 108), (60, 122), (75, 136)], factor), fill=mint, width=stroke, joint="curve")
    draw.line(scale_points([(181, 108), (196, 122), (181, 136)], factor), fill=mint, width=stroke, joint="curve")
    return image


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    base = draw_icon(1024)
    png_256 = base.resize((256, 256), Image.Resampling.LANCZOS)
    png_256.save(ICON_DIR / "keynest-256.png")

    frames = [base.resize((size, size), Image.Resampling.LANCZOS) for size in (256, 128, 64, 48, 32, 16)]
    frames[0].save(ICON_DIR / "icon.ico", sizes=[(frame.width, frame.height) for frame in frames], append_images=frames[1:])


if __name__ == "__main__":
    main()
