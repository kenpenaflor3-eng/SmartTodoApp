#!/usr/bin/env python3
import qrcode
import os

url = "http://172.27.169.61:8000/app-release.apk"
output_path = os.path.join(os.path.dirname(__file__), "apk-download-qr.png")

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save(output_path)

print(f"QR code saved to: {output_path}")
print(f"URL encoded: {url}")
