from PIL import Image
import os

src = r"A:\JAva\web-groomer-app\frontend\src\assets\mini-logo.jpg"
out = r"A:\JAva\web-groomer-app\frontend\src\assets\mini-logo.png"

img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

# Brand cream for dark Soft charcoal UI
fg = (243, 238, 230, 255)

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        avg = (r + g + b) / 3
        # Light / cream = transparent
        if min(r, g, b) > 190 and avg > 205:
            pixels[x, y] = (0, 0, 0, 0)
        elif r > 215 and g > 205 and b > 190:
            pixels[x, y] = (0, 0, 0, 0)
        else:
            # Keep logo shape, recolor to brand cream (preserve soft edges via alpha)
            # Darker original = more opaque
            darkness = max(0, min(255, int(255 - avg)))
            alpha = min(255, int(darkness * 1.35))
            pixels[x, y] = (fg[0], fg[1], fg[2], alpha)

img.save(out, "PNG", optimize=True)
print("saved", out, os.path.getsize(out), img.size)
