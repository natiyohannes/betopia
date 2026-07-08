from PIL import Image
import os

try:
    img_500 = Image.open('public/11111111111.jpg')
    img_500.save('public/payment_qr_500.png')
    os.remove('public/11111111111.jpg')

    img_200 = Image.open('public/222222222222.jpg')
    img_200.save('public/payment_qr_200.png')
    os.remove('public/222222222222.jpg')
    print("Successfully converted to PNG!")
except Exception as e:
    print(f"Error: {e}")

