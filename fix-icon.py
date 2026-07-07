import os, shutil, glob
from PIL import Image

img = Image.open("icon-512.png").convert("RGBA")
res = "android/app/src/main/res"

# استبدال جميع أحجام الأيقونة
for dpi, size in [("mdpi",48),("hdpi",72),("xhdpi",96),("xxhdpi",144),("xxxhdpi",192)]:
    d = f"{res}/mipmap-{dpi}"
    os.makedirs(d, exist_ok=True)
    r = img.resize((size, size), Image.LANCZOS)
    r.save(f"{d}/ic_launcher.png")
    r.save(f"{d}/ic_launcher_round.png")
    r.save(f"{d}/ic_launcher_foreground.png")

# أيقونة الـ Adaptive Icon (foreground PNG)
os.makedirs(f"{res}/drawable", exist_ok=True)
img.resize((432, 432), Image.LANCZOS).save(f"{res}/drawable/ic_launcher_foreground.png")

# حذف كل ملفات vector drawable في كل المجلدات (هذا سبب ظهور أيقونة الروبوت!)
for f in glob.glob(f"{res}/**/ic_launcher_foreground.xml", recursive=True):
    os.remove(f)
    print(f"Removed vector: {f}")

# كتابة ملفات Adaptive Icon XML
xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>'''

os.makedirs(f"{res}/mipmap-anydpi-v26", exist_ok=True)
open(f"{res}/mipmap-anydpi-v26/ic_launcher.xml", "w").write(xml)
open(f"{res}/mipmap-anydpi-v26/ic_launcher_round.xml", "w").write(xml)

# تغيير لون الخلفية للأخضر
import re
for f in glob.glob(f"{res}/**/*.xml", recursive=True):
    try:
        c = open(f).read()
        if 'ic_launcher_background' in c and '<color' in c:
            new = re.sub(
                r'<color name="ic_launcher_background">[^<]*</color>',
                '<color name="ic_launcher_background">#10b981</color>', c)
            if new != c:
                open(f, "w").write(new)
                print(f"Updated bg: {f}")
    except:
        pass

print("Done! Icon replaced successfully.")
