from PIL import Image

def crop_qr(filename):
    img = Image.open(filename).convert('RGB')
    width, height = img.size
    
    # Simple heuristic to crop a QR code from a larger image.
    # Usually the QR code is centered and is a square. 
    # Let's try to find the bounds.
    # Let's just crop to a central square for now.
    
    # The user provided images that look like they are just the QR code,
    # but the original image had text above and below it.
    
    # Find bounding box of dark pixels to isolate the QR code?
    # Or find the top-most and bottom-most black pixels?
    
    pixels = img.load()
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            # QR code is black and white, so black pixels are near (0,0,0)
            if r < 100 and g < 100 and b < 100:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    # Add a small padding (e.g., 20 pixels)
    padding = 20
    min_x = max(0, min_x - padding)
    min_y = max(0, min_y - padding)
    max_x = min(width, max_x + padding)
    max_y = min(height, max_y + padding)
    
    cropped = img.crop((min_x, min_y, max_x, max_y))
    # Make it a square if possible, to match typical QR code shape
    c_w, c_h = cropped.size
    if abs(c_w - c_h) > 50:
        # Not a square, maybe our heuristic failed.
        pass
        
    cropped.save(filename)
    print(f"Cropped {filename} to ({min_x}, {min_y}, {max_x}, {max_y})")

try:
    crop_qr("public/payment_qr_200.png")
    crop_qr("public/payment_qr_500.png")
except Exception as e:
    print(f"Error: {e}")
