from PIL import Image
import numpy as np

def process_icon(icon_file):
    print(f"Processing {icon_file}...")
    
    # Open the image
    img = Image.open(icon_file)
    img = img.convert("RGBA")
    
    # Convert to numpy array
    data = np.array(img)
    height, width = data.shape[:2]
    
    # Create output image
    result = data.copy()
    
    # Strategy: Use connected component analysis
    # White pixels connected to edges = background (remove)
    # White pixels NOT connected to edges = circle/bubble (keep)
    
    visited = np.zeros((height, width), dtype=bool)
    background_mask = np.zeros((height, width), dtype=bool)
    
    def is_white(pixel):
        return pixel[0] > 240 and pixel[1] > 240 and pixel[2] > 240
    
    def flood_fill_background(start_x, start_y):
        """Flood fill to mark background white pixels"""
        stack = [(start_x, start_y)]
        
        while stack:
            x, y = stack.pop()
            
            if x < 0 or x >= width or y < 0 or y >= height:
                continue
            if visited[y, x]:
                continue
            if not is_white(data[y, x]):
                continue
                
            visited[y, x] = True
            background_mask[y, x] = True
            
            # Add neighbors (4-connectivity)
            stack.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])
    
    # Start flood fill from all edges
    # Top and bottom edges
    for x in range(width):
        if is_white(data[0, x]) and not visited[0, x]:
            flood_fill_background(x, 0)
        if is_white(data[height-1, x]) and not visited[height-1, x]:
            flood_fill_background(x, height-1)
    
    # Left and right edges
    for y in range(height):
        if is_white(data[y, 0]) and not visited[y, 0]:
            flood_fill_background(0, y)
        if is_white(data[y, width-1]) and not visited[y, width-1]:
            flood_fill_background(width-1, y)
    
    # Apply transparency to background white pixels only
    for y in range(height):
        for x in range(width):
            if background_mask[y, x]:
                result[y, x] = [255, 255, 255, 0]  # Make transparent
    
    # Convert back to PIL Image
    result_img = Image.fromarray(result, 'RGBA')
    
    # Save
    output_file = icon_file.replace('.png', '_transparent_final.png')
    result_img.save(output_file, "PNG")
    print(f"  ✓ Saved as {output_file}")
    
    return output_file

# Process all icons
icon_files = ['icon_16x16.png', 'icon_32x32.png', 'icon_48x48.png', 'icon_128x128.png']

for icon_file in icon_files:
    process_icon(icon_file)

print("\n✅ All icons processed successfully!")
print("White circle border and chat bubble preserved.")
print("Background white areas made transparent.")
