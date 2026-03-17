import os, math, struct, zlib
out_dir = r"frontend/src/accueil-ui/sections/images/categories"
os.makedirs(out_dir, exist_ok=True)
colors = {
    'math': '#50CAFF',
    'francais': '#FFA826',
    'sciences': '#28A745',
    'histoire': '#6F42C1',
    'sport': '#FD7E14',
    'trivia': '#A837BE',
    'art': '#DC3545',
    'ti': '#007BFF',
    'sante': '#1E2631',
    'legal': '#6F42C1',
    'construction': '#FD7E14',
    'admin': '#50CAFF',
    'politique': '#28A745',
    'ingenieur': '#FFC107',
    'films': '#DC3545',
    'monde': '#007BFF',
    'general': '#FFC107',
}
SIZE = 512
CENTER = SIZE//2
R_BASE = SIZE//3

def hex_to_rgba(h, a=255):
    return tuple(int(h[i:i+2],16) for i in (1,3,5)) + (a,)

def write_png(path, pixels, w, h):
    # pixels: list of bytes length w*h*4
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0
        start = y*w*4
        raw.extend(pixels[start:start+w*4])
    compressor = zlib.compressobj()
    data = compressor.compress(bytes(raw)) + compressor.flush()
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag+data)&0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', data)
    iend = chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(sig+ihdr+idat+iend)

def draw_circle(buf, cx, cy, r, color):
    r2 = r*r
    for y in range(int(cy-r), int(cy+r)+1):
        if y < 0 or y >= SIZE: continue
        dy2 = (y - cy)*(y - cy)
        for x in range(int(cx-r), int(cx+r)+1):
            if x < 0 or x >= SIZE: continue
            dx2 = (x - cx)*(x - cx)
            if dx2 + dy2 <= r2:
                idx = (y*SIZE + x)*4
                buf[idx:idx+4] = color

def draw_triangle(buf, p1, p2, p3, color):
    minx = max(int(min(p1[0],p2[0],p3[0])), 0)
    maxx = min(int(max(p1[0],p2[0],p3[0]))+1, SIZE-1)
    miny = max(int(min(p1[1],p2[1],p3[1])), 0)
    maxy = min(int(max(p1[1],p2[1],p3[1]))+1, SIZE-1)
    def area(a,b,c):
        return (a[0]*(b[1]-c[1]) + b[0]*(c[1]-a[1]) + c[0]*(a[1]-b[1]))
    A = area(p1,p2,p3)
    for y in range(miny, maxy+1):
        for x in range(minx, maxx+1):
            p = (x+0.5, y+0.5)
            w1 = area(p2,p3,p)/A
            w2 = area(p3,p1,p)/A
            w3 = area(p1,p2,p)/A
            if w1>=0 and w2>=0 and w3>=0:
                idx = (y*SIZE + x)*4
                buf[idx:idx+4] = color

def draw_dot(buf, cx, cy, r, color):
    draw_circle(buf, cx, cy, r, color)

def make_icon(hexcol):
    buf = bytearray([0]*SIZE*SIZE*4)
    col = hex_to_rgba(hexcol)
    # base soft circle
    draw_circle(buf, CENTER, CENTER, R_BASE, col[:-1]+(90,))
    # triangle body
    r_poly = R_BASE*0.9
    p1 = (CENTER, CENTER - r_poly)
    p2 = (CENTER + r_poly, CENTER + r_poly*0.85)
    p3 = (CENTER - r_poly, CENTER + r_poly*0.85)
    draw_triangle(buf, p1, p2, p3, col)
    # highlight inner
    draw_circle(buf, CENTER, CENTER, R_BASE*0.35, (255,255,255,40))
    # small dot
    draw_circle(buf, int(CENTER + R_BASE*0.4), CENTER, R_BASE*0.12, col)
    return buf

for name, hexcol in colors.items():
    pixels = make_icon(hexcol)
    out_path = os.path.join(out_dir, f"{name}.png")
    write_png(out_path, pixels, SIZE, SIZE)
print('generated', len(colors))