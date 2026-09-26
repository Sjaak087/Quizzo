from pathlib import Path
import math, random, textwrap

ROOT = Path('/mnt/data/quizzo_v17_work/themes')
ROOT.mkdir(parents=True, exist_ok=True)
random.seed(42)

W,H=1440,900

def svg_start(name, sky1, sky2):
    return [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">''',
'''<defs>''',
 f'''  <linearGradient id="bg-{name}" x1="0" y1="0" x2="0" y2="1">''',
 f'''    <stop offset="0" stop-color="{sky1}"/>''', f'''    <stop offset="1" stop-color="{sky2}"/>''','''  </linearGradient>''',
'''  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">''','''    <stop offset="0" stop-color="#ffffff" stop-opacity=".18"/>''','''    <stop offset="1" stop-color="#000000" stop-opacity=".18"/>''','''  </linearGradient>''',
'''  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">''','''    <stop offset="0" stop-color="#ffffff" stop-opacity=".34"/>''','''    <stop offset="1" stop-color="#ffffff" stop-opacity=".05"/>''','''  </linearGradient>''',
'''  <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">''','''    <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000" flood-opacity=".25"/>''','''  </filter>''',
'''  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">''','''    <feGaussianBlur stdDeviation="18"/>''','''  </filter>''',
'''  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">''','''    <feGaussianBlur stdDeviation="10" result="b"/>''','''    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>''','''  </filter>''',
'''</defs>''',
 f'''<rect width="{W}" height="{H}" fill="url(#bg-{name})"/>''']

def close(lines):
    lines += ['<rect width="1440" height="900" fill="url(#ground)" opacity=".25"/>','</svg>']
    return lines

def cloud(lines,x,y,s=1,c="#fff",o=.75):
    lines += [f'<g transform="translate({x} {y}) scale({s})" opacity="{o}" filter="url(#soft)">',
              '<ellipse cx="0" cy="20" rx="90" ry="35" fill="%s"/>'%c,
              '<circle cx="-45" cy="10" r="38" fill="%s"/>'%c,
              '<circle cx="10" cy="-5" r="45" fill="%s"/>'%c,
              '<circle cx="55" cy="15" r="32" fill="%s"/>'%c,
              '</g>']

def mountain(lines,x,y,w,h,c1,c2=None):
    c2=c2 or c1
    lines += [f'<g transform="translate({x} {y})">',
              f'<path d="M0 {h} L{w*0.2} {h*0.35} L{w*0.38} {h*0.62} L{w*0.58} 0 L{w*0.83} {h*0.48} L{w} {h} Z" fill="{c1}"/>',
              f'<path d="M{w*0.58} 0 L{w*0.68} {h*0.2} L{w*0.75} {h*0.38} L{w*0.83} {h*0.48} L{w*0.58} {h*0.22} L{w*0.44} {h*0.58} Z" fill="{c2}" opacity=".65"/>',
              '</g>']

def tree(lines,x,y,s=1,leaf="#2a7e50",trunk="#6d442a",snow=False):
    lines += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',
              '<rect x="-14" y="130" width="28" height="90" rx="9" fill="%s"/>'%trunk,
              '<path d="M0 0 L-70 100 L70 100 Z" fill="%s"/>'%leaf,
              '<path d="M0 45 L-55 135 L55 135 Z" fill="%s"/>'%leaf,
              '<path d="M0 90 L-40 165 L40 165 Z" fill="%s"/>'%leaf,
              '<path d="M-35 78 Q0 60 35 78" stroke="rgba(0,0,0,.15)" stroke-width="8" fill="none"/>',
              '<path d="M-23 122 Q0 104 23 122" stroke="rgba(0,0,0,.15)" stroke-width="8" fill="none"/>',
              '</g>']
    if snow:
        lines += [f'<g transform="translate({x} {y}) scale({s})" opacity=".9">',
                  '<path d="M-58 98 Q-15 81 34 98 Q12 112 -16 111 Q-40 111 -58 98Z" fill="#f8fbff"/>',
                  '<path d="M-45 137 Q-8 122 38 137 Q15 151 -12 150 Q-33 149 -45 137Z" fill="#f8fbff"/>',
                  '</g>']

def lamppost(lines,x,y,s=1,color="#6d5544"):
    lines += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',
              '<rect x="-7" y="0" width="14" height="175" rx="6" fill="%s"/>'%color,
              '<path d="M0 8 Q0 -30 38 -30 H66 V-16 H43 Q20 -16 20 8Z" fill="%s"/>'%color,
              '<rect x="38" y="-27" width="28" height="32" rx="8" fill="#ffd66a" filter="url(#glow)"/>',
              '</g>']

def snowman(lines,x,y,s=1):
    lines += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',
              '<circle cx="0" cy="112" r="72" fill="#fff"/>',
              '<circle cx="0" cy="42" r="55" fill="#fff"/>',
              '<circle cx="0" cy="-28" r="40" fill="#fff"/>',
              '<circle cx="-13" cy="-36" r="5" fill="#222"/>','<circle cx="14" cy="-36" r="5" fill="#222"/>',
              '<path d="M0 -22 L42 -10 L0 -5Z" fill="#f08a31"/>',
              '<path d="M-20 2 Q0 18 20 2" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round"/>',
              '<rect x="-48" y="-77" width="96" height="18" rx="7" fill="#2f3b54"/>',
              '<rect x="-32" y="-116" width="64" height="42" rx="7" fill="#2f3b54"/>',
              '<path d="M-58 48 Q-95 30 -110 4" stroke="#6a452a" stroke-width="10" stroke-linecap="round"/>',
              '<path d="M58 48 Q95 30 110 4" stroke="#6a452a" stroke-width="10" stroke-linecap="round"/>',
              '<circle cx="0" cy="38" r="6" fill="#273244"/><circle cx="0" cy="72" r="6" fill="#273244"/><circle cx="0" cy="106" r="6" fill="#273244"/>',
              '</g>']

def palm(lines,x,y,s=1):
    lines += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',
              '<path d="M0 190 Q15 115 3 30" stroke="#9c673f" stroke-width="26" fill="none" stroke-linecap="round"/>',
              '<path d="M5 40 Q-70 14 -95 35 Q-50 50 -5 58" fill="#2b9c58"/>',
              '<path d="M10 40 Q80 0 104 28 Q65 47 18 58" fill="#2b9c58"/>',
              '<path d="M2 36 Q-2 -42 22 -84 Q42 -28 18 40" fill="#42b867"/>',
              '<path d="M7 41 Q42 -25 89 -42 Q66 4 14 57" fill="#1f854e"/>',
              '<path d="M4 38 Q-52 -14 -92 -12 Q-55 25 8 58" fill="#39ae61"/>',
              '</g>']

def flower(lines,x,y,s=1,c1="#ff77a8",c2="#ffd966"):
    lines += [f'<g transform="translate({x} {y}) scale({s})">',
              '<path d="M0 58 Q5 25 0 -5" stroke="#2f8b50" stroke-width="7" fill="none"/>',
              f'<circle cx="0" cy="-10" r="16" fill="{c2}"/>',
              f'<circle cx="0" cy="-32" r="17" fill="{c1}"/><circle cx="22" cy="-20" r="17" fill="{c1}"/><circle cx="-22" cy="-20" r="17" fill="{c1}"/><circle cx="0" cy="12" r="17" fill="{c1}"/>',
              '</g>']

def fish(lines,x,y,s=1,c="#ff8a3d",flip=1):
    lines += [f'<g transform="translate({x} {y}) scale({s*flip} {s})" filter="url(#shadow)">',
              f'<ellipse cx="0" cy="0" rx="54" ry="30" fill="{c}"/>',
              '<path d="M45 0 L82 -26 L82 26 Z" fill="%s"/>'%c,
              '<circle cx="-25" cy="-8" r="6" fill="#fff"/><circle cx="-25" cy="-8" r="3" fill="#222"/>',
              '</g>']

def bubble(lines,x,y,s=1):
    lines += [f'<circle cx="{x}" cy="{y}" r="{12*s}" fill="#eaffff" fill-opacity=".38" stroke="#fff" stroke-opacity=".38" stroke-width="3"/>',
              f'<circle cx="{x-5*s}" cy="{y-5*s}" r="{3*s}" fill="#fff" fill-opacity=".8"/>']

def ball(lines,x,y,s=1,c="#fff",stroke="#333"):
    lines += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',f'<circle r="36" fill="{c}" stroke="{stroke}" stroke-width="6"/>','<path d="M-32 -2 Q-7 -18 14 -8 Q28 4 34 18" fill="none" stroke="#333" stroke-width="5"/>','<path d="M-6 -34 Q4 -10 0 8 Q-2 20 -16 34" fill="none" stroke="#333" stroke-width="5"/>','</g>']

def balloons(lines,x,y,s=1,colors=("#e83d57","#2d8cff","#ffd452","#52c26f")):
    for i,c in enumerate(colors):
        xx=x+(i-1.5)*46
        yy=y+(i%2)*20
        lines += [f'<g transform="translate({xx} {yy}) scale({s})" filter="url(#shadow)">',f'<ellipse cx="0" cy="0" rx="26" ry="34" fill="{c}"/>','<path d="M0 33 Q0 62 4 90" stroke="#777" stroke-width="3" fill="none"/>','<path d="M-11 -16 Q-2 -28 10 -15" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none"/>','</g>']

def draw_winter():
    L=svg_start('winter','#75bff0','#e8f4ff')
    for x,y,w,h,c1,c2 in [(0,240,780,330,'#6d9bc8','#8fb7db'),(620,220,820,360,'#547ca8','#769fc6'),(-180,390,900,300,'#40688c','#638eb8')]: mountain(L,x,y,w,h,c1,c2)
    # distant village
    for x in range(120,1360,150):
        h=90+(x%3)*22
        L += [f'<g transform="translate({x} {620-h})" filter="url(#shadow)">',f'<rect x="0" y="0" width="92" height="{h}" rx="8" fill="#c9d9e8"/>',f'<path d="M-12 20 L46 -24 L104 20 Z" fill="#9e5d52"/>','<rect x="16" y="44" width="22" height="38" rx="3" fill="#ffd86c"/><rect x="54" y="44" width="22" height="38" rx="3" fill="#ffd86c"/>','</g>']
    for x in [90,250,1320,1120,480]: tree(L,x,470 if x!=1120 else 500,1.0,'#1f6b46','#62442e',True)
    snowman(L,1020,545,1.1)
    for x in [140,360,780,1260]: lamppost(L,x,520,.9)
    L += ['<path d="M0 655 Q260 595 520 664 T1040 646 T1440 660 V900 H0Z" fill="#f9fcff"/>','<path d="M0 760 Q340 690 700 770 T1440 750 V900 H0Z" fill="#d7e6f3" opacity=".9"/>']
    # ski track and sled
    L += ['<path d="M210 780 Q420 730 600 790 T960 785" fill="none" stroke="#9ab7cd" stroke-width="24" stroke-linecap="round" opacity=".8"/>','<g transform="translate(1180 740) rotate(12)" filter="url(#shadow)"><path d="M0 0 q85 10 120 45" stroke="#8a4d2f" stroke-width="12" fill="none"/><path d="M14 35 q55 10 96 25" stroke="#b5793f" stroke-width="10" fill="none"/></g>']
    for i in range(38):
        x=random.randint(20,1420); y=random.randint(70,790); s=random.choice([.65,.8,1,1.2])
        L += [f'<g transform="translate({x} {y}) scale({s})" opacity="{random.choice([.45,.6,.75,.9])}"><path d="M0 -10 L6 0 L0 10 L-6 0Z" fill="#fff"/><path d="M-9 0 H9 M0 -9 V9" stroke="#fff" stroke-width="2"/></g>']
    return close(L)

def draw_christmas():
    L=svg_start('christmas','#142f57','#7b1c2b')
    cloud(L,220,120,1.1,'#fff',.12); cloud(L,1140,160,.8,'#fff',.12)
    # town roofs
    for x in range(30,1450,180):
        y=510+(x%4)*15; h=150
        L += [f'<g transform="translate({x} {y})" filter="url(#shadow)">',f'<rect x="0" y="0" width="125" height="{h}" rx="8" fill="#a84c43"/>','<path d="M-20 20 L62 -58 L145 20 Z" fill="#56364b"/>','<path d="M-5 8 L62 -58 L128 8" stroke="#fff" stroke-opacity=".85" stroke-width="16" fill="none"/>','<rect x="18" y="44" width="28" height="48" fill="#ffd66a"/><rect x="78" y="44" width="28" height="48" fill="#ffd66a"/>','</g>']
    # big tree center
    L += ['<g transform="translate(720 205)" filter="url(#shadow)"><path d="M0 0 L-170 420 H170 Z" fill="#126b46"/><path d="M0 85 L-145 470 H145 Z" fill="#197b4e"/><path d="M0 170 L-115 520 H115 Z" fill="#229158"/><rect x="-26" y="430" width="52" height="100" rx="10" fill="#7a4a2d"/><path d="M-170 420 Q0 370 170 420" stroke="#f8fbff" stroke-opacity=".65" stroke-width="18" fill="none"/></g>']
    # ornaments
    for x,y,c in [(650,330,'#e33e45'),(780,315,'#ffd452'),(710,410,'#2d8cff'),(835,395,'#ef6fbb'),(625,450,'#ffd452'),(760,470,'#e33e45')]:
        L += [f'<circle cx="{x}" cy="{y}" r="15" fill="{c}" filter="url(#shadow)"/><path d="M{x} {y-16} V{y-34}" stroke="#fff" stroke-width="3"/>']
    # gifts
    for x,c1,c2 in [(540,'#e63f52','#ffd452'),(870,'#2d8cff','#e63f52'),(465,'#ffd452','#e63f52'),(950,'#58c36d','#fff')]:
        L += [f'<g transform="translate({x} 690)" filter="url(#shadow)"><rect x="0" y="0" width="120" height="95" rx="10" fill="{c1}"/><rect x="52" y="0" width="16" height="95" fill="{c2}"/><rect x="0" y="37" width="120" height="16" fill="{c2}"/><path d="M60 0 Q38 -26 22 0 M60 0 Q82 -26 98 0" fill="none" stroke="{c2}" stroke-width="12"/></g>']
    for x in [110,1330]: lamppost(L,x,545,1)
    # snow
    L += ['<path d="M0 785 Q330 705 660 790 T1440 770 V900 H0Z" fill="#fff"/>']
    for i in range(34):
        x=random.randint(0,1430);y=random.randint(50,820)
        L += [f'<g transform="translate({x} {y})" opacity=".9"><path d="M0 -11 L6 0 L0 11 L-6 0Z" fill="#fff"/><path d="M-9 0 H9 M0 -9 V9" stroke="#fff" stroke-width="2"/></g>']
    return close(L)

def draw_classroom():
    L=svg_start('classroom','#9cc5d9','#d4a46d')
    L += ['<rect x="0" y="0" width="1440" height="570" fill="#f7e9d5"/>','<rect x="0" y="570" width="1440" height="330" fill="#be8a56"/>','<path d="M0 570 L1440 570" stroke="#784a2f" stroke-width="14"/>']
    # windows
    for x in [80,1070]:
        L += [f'<g transform="translate({x} 115)" filter="url(#shadow)"><rect x="0" y="0" width="270" height="220" rx="10" fill="#6e503d"/><rect x="18" y="18" width="234" height="184" fill="#79c1df"/><path d="M135 18 V202 M18 110 H252" stroke="#f3ead7" stroke-width="12"/><circle cx="60" cy="55" r="10" fill="#fff" opacity=".8"/><path d="M30 162 Q120 110 240 170" stroke="#fff" stroke-width="7" fill="none" opacity=".6"/></g>']
    # chalkboard
    L += ['<g transform="translate(440 95)" filter="url(#shadow)"><rect x="0" y="0" width="560" height="305" rx="12" fill="#6f452f"/><rect x="24" y="24" width="512" height="257" rx="10" fill="#315a4f"/><path d="M72 78 H400 M72 125 H470 M72 172 H360" stroke="#f5f2dc" stroke-width="10" stroke-linecap="round" opacity=".8"/><text x="72" y="235" font-size="46" font-weight="800" fill="#f5f2dc">QUIZ TIME!</text><circle cx="452" cy="74" r="34" fill="#e65d58"/><path d="M438 74 l12 12 23-29" stroke="#fff" stroke-width="8" fill="none"/></g>']
    # desks
    for row,y in enumerate([520,650,780]):
        for col,x in enumerate([250,560,870,1180]):
            dx=x+(row%2)*35
            L += [f'<g transform="translate({dx} {y})" filter="url(#shadow)"><path d="M0 38 L22 0 H190 L212 38 Z" fill="#9e683f"/><rect x="8" y="32" width="194" height="18" rx="6" fill="#7b4a2f"/><path d="M30 50 V100 M182 50 V100" stroke="#5f3d2b" stroke-width="10"/></g>']
    # globe, books, plant
    L += ['<g transform="translate(230 170)" filter="url(#shadow)"><circle r="62" fill="#4fb0cf" stroke="#805c3e" stroke-width="12"/><path d="M-54 0 Q0 -35 56 -4 M-38 35 Q6 10 42 28 M0 -62 V62" stroke="#c4ecf5" stroke-width="5" fill="none"/><path d="M-68 70 H68" stroke="#805c3e" stroke-width="16"/></g>',
          '<g transform="translate(1170 180)" filter="url(#shadow)"><path d="M0 120 Q0 65 15 10" stroke="#6f4a2f" stroke-width="10" fill="none"/><ellipse cx="-24" cy="15" rx="32" ry="15" fill="#4b9e58" transform="rotate(-25)"/><ellipse cx="34" cy="35" rx="32" ry="15" fill="#4b9e58" transform="rotate(22)"/><path d="M-18 120 H48" stroke="#805c3e" stroke-width="16"/></g>']
    for i in range(14):
        x=60+i*100; y=430
        L += [f'<circle cx="{x}" cy="{y}" r="4" fill="#7d6656" opacity=".55"/>']
    return close(L)

def draw_ocean():
    L=svg_start('ocean','#0a7cb6','#05386b')
    L += ['<path d="M0 0 H1440 V230 Q1120 180 900 235 T0 200Z" fill="#55c7ef" opacity=".22"/>','<path d="M0 690 Q260 610 520 700 T990 680 T1440 700 V900 H0Z" fill="#0a4a57"/>']
    # light rays
    for x,w in [(110,80),(380,120),(720,150),(1090,100),(1320,72)]:
        L += [f'<path d="M{x} 0 L{x+w} 0 L{x+w*2} 620 L{x-w} 620 Z" fill="#b9f4ff" opacity=".07"/>']
    # seabed rocks/coral
    for x,c in [(90,'#ed6b70'),(210,'#f19b49'),(360,'#8a63d1'),(520,'#ef5c7a'),(1110,'#e7a24c'),(1260,'#7f66d6')]:
        L += [f'<g transform="translate({x} 720)" filter="url(#shadow)"><circle cx="0" cy="0" r="62" fill="{c}" opacity=".85"/><path d="M-20 40 Q-50 -40 -16 -72 Q0 -20 13 -72 Q42 -45 22 42" fill="{c}"/></g>']
    # seaweed
    for x in range(20,1420,85):
        h=80+(x%5)*28
        L += [f'<path d="M{x} 875 Q{x-28} {875-h*0.5} {x+8} {875-h} Q{x+30} {875-h*0.45} {x+16} 875" fill="none" stroke="#2dc08a" stroke-width="14" stroke-linecap="round"/>']
    # fish, turtle, chest
    for args in [(230,300,1.2,'#ff7c54',1),(470,430,.9,'#ffd452',-1),(1010,290,1,'#7fd6ff',1),(1240,430,1.1,'#ff6e9b',-1)]: fish(L,*args)
    L += ['<g transform="translate(760 520)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="120" ry="70" fill="#7ad48b"/><circle cx="105" cy="-12" r="40" fill="#7ad48b"/><path d="M-65 -10 Q-10 -55 55 -10 Q14 30 -65 -10Z" fill="#4b9e61"/><path d="M-65 25 Q-120 70 -96 92 M55 25 Q110 68 90 92" stroke="#5a9e67" stroke-width="20" fill="none" stroke-linecap="round"/></g>',
          '<g transform="translate(560 700)" filter="url(#shadow)"><rect x="-75" y="-50" width="150" height="100" rx="8" fill="#8f5b35"/><path d="M-75 -15 Q0 -85 75 -15" fill="#a76d3e"/><rect x="-10" y="-32" width="20" height="60" fill="#ffd452"/></g>']
    for i in range(45): bubble(L,random.randint(30,1410),random.randint(80,760),random.choice([.5,.7,1,1.4]))
    return close(L)

def draw_space():
    L=svg_start('space','#06051c','#281058')
    # nebula clouds
    for x,y,c,o in [(230,220,'#6f3bff',.28),(910,160,'#ff3f88',.22),(1160,430,'#2ed9ff',.18),(450,620,'#3b75ff',.16)]:
        L += [f'<ellipse cx="{x}" cy="{y}" rx="260" ry="120" fill="{c}" opacity="{o}" filter="url(#soft)" transform="rotate({(x%70)-35} {x} {y})"/>']
    # stars
    for i in range(110):
        x=random.randint(10,1430);y=random.randint(20,820);r=random.choice([1,1.5,2,2.5]);o=random.choice([.5,.7,.9])
        L += [f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" opacity="{o}"/>']
    # planets
    for x,y,r,c in [(290,250,100,'#5a6fe8'),(1120,240,150,'#e36b6b'),(920,560,68,'#edb35b')]:
        L += [f'<g transform="translate({x} {y})" filter="url(#shadow)"><circle r="{r}" fill="{c}"/><ellipse rx="{r*1.4}" ry="{r*.32}" fill="none" stroke="#cbe9ff" stroke-opacity=".5" stroke-width="18" transform="rotate(-14)"/><circle cx="{-r*.25}" cy="{-r*.2}" r="{r*.18}" fill="#fff" opacity=".1"/></g>']
    # space station
    L += ['<g transform="translate(740 250) rotate(-8)" filter="url(#shadow)"><rect x="-110" y="-22" width="220" height="44" rx="22" fill="#dbe9ff"/><rect x="-75" y="-85" width="36" height="170" rx="12" fill="#b7cce8"/><rect x="39" y="-85" width="36" height="170" rx="12" fill="#b7cce8"/><rect x="-190" y="-14" width="70" height="28" fill="#5f89b4"/><rect x="120" y="-14" width="70" height="28" fill="#5f89b4"/><circle r="28" fill="#79c3ef"/></g>']
    # rocket
    L += ['<g transform="translate(520 600) rotate(-18)" filter="url(#shadow)"><path d="M0 -120 Q55 -68 0 115 Q-55 -68 0 -120Z" fill="#e7ecff"/><path d="M0 -72 Q25 -45 0 0 Q-25 -45 0 -72Z" fill="#6dc9ff"/><path d="M-42 48 L-95 84 L-44 96Z" fill="#e15d6c"/><path d="M42 48 L95 84 L44 96Z" fill="#e15d6c"/><path d="M-18 100 Q0 180 18 100" stroke="#ffb347" stroke-width="18" fill="none" stroke-linecap="round"/></g>']
    # asteroids
    for x,y,s in [(140,660,1),(330,510,.7),(1180,650,.9),(1350,520,.55),(780,720,.5)]:
        L += [f'<path d="M{x} {y-32*s} L{x+28*s} {y-18*s} L{x+38*s} {y+18*s} L{x} {y+35*s} L{x-36*s} {y+8*s} L{x-25*s} {y-24*s} Z" fill="#67587b"/><circle cx="{x-10*s}" cy="{y}" r="{6*s}" fill="#41364f"/>']
    return close(L)

def draw_jungle():
    L=svg_start('jungle','#59c86b','#1b5138')
    cloud(L,180,90,1.1,'#f6ffcc',.14); cloud(L,1160,80,.9,'#f6ffcc',.11)
    # distant cliffs
    mountain(L,0,250,650,380,'#2e8f56','#44ab62'); mountain(L,650,220,800,390,'#266f4a','#3c9658')
    # waterfall
    L += ['<path d="M710 240 Q760 210 810 240 L790 720 L730 720Z" fill="#b5f3ff" opacity=".82"/>','<path d="M735 250 Q760 236 785 250 L770 715 L750 715Z" fill="#fff" opacity=".4"/>','<path d="M700 710 Q760 670 825 710" stroke="#7bd9ec" stroke-width="28" fill="none"/>']
    # foreground jungle banks
    for x,c in [(120,'#236945'),(420,'#2d7d49'),(1000,'#1f623f'),(1290,'#2c7749')]:
        L += [f'<ellipse cx="{x}" cy="780" rx="220" ry="110" fill="{c}"/>']
    # big leaves
    for x,y,ang,s,c in [(70,200,-30,1.3,'#2aa157'),(180,330,22,1.0,'#49b968'),(1290,250,28,1.3,'#2a9455'),(1380,420,-28,1.1,'#44b967'),(1080,360,-45,.95,'#3eae61')]:
        L += [f'<g transform="translate({x} {y}) rotate({ang}) scale({s})"><path d="M0 0 Q100 -20 155 10 Q85 55 0 0Z" fill="{c}"/><path d="M0 0 L145 12" stroke="#1b7041" stroke-width="7"/></g>']
    # parrot
    L += ['<g transform="translate(1070 170)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="48" ry="62" fill="#e04b62"/><circle cx="0" cy="-54" r="34" fill="#3c7be8"/><path d="M-30 -50 L-82 -22 L-35 -10Z" fill="#ffd452"/><circle cx="10" cy="-58" r="6" fill="#fff"/><circle cx="12" cy="-58" r="3" fill="#222"/><path d="M45 6 Q90 36 98 75" stroke="#dcae62" stroke-width="8" fill="none"/></g>']
    # ruin stones
    for x,y,s in [(270,690,1),(360,730,.8),(1160,720,1.05)]:
        L += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)"><rect x="-35" y="-90" width="70" height="150" rx="8" fill="#806b57"/><rect x="-22" y="-102" width="44" height="18" rx="6" fill="#98806a"/></g>']
    # vines
    for x in [40,310,920,1390]:
        L += [f'<path d="M{x} 0 Q{x+70} 180 {x-20} 360 T{x+20} 720" stroke="#166a3c" stroke-width="18" fill="none" opacity=".9"/>']
    for i in range(35):
        x=random.randint(20,1420); y=random.randint(80,820); r=random.randint(8,18)
        L += [f'<ellipse cx="{x}" cy="{y}" rx="{r*2}" ry="{r}" fill="{random.choice(["#54c86b","#2e8f56","#6fd37a"])}" opacity=".8" transform="rotate({random.randint(-45,45)} {x} {y})"/>']
    return close(L)

def draw_candy():
    L=svg_start('candy','#85d8ff','#ffb5d8')
    cloud(L,220,130,1.0,'#fff',.7); cloud(L,1130,150,.8,'#fff',.65)
    # hills
    L += ['<path d="M0 610 Q200 420 400 610 T800 590 T1200 610 T1440 560 V900 H0Z" fill="#f4a5cf"/>','<path d="M0 720 Q250 570 520 730 T1040 700 T1440 710 V900 H0Z" fill="#fbd97f"/>']
    # candy houses
    for x,c in [(160,'#ff6c9e'),(520,'#61c9ef'),(900,'#a878eb'),(1200,'#ff9b5d')]:
        L += [f'<g transform="translate({x} 500)" filter="url(#shadow)"><rect x="0" y="0" width="180" height="150" rx="22" fill="{c}"/><path d="M-20 20 L90 -70 L200 20 Z" fill="#fff0f6"/><path d="M15 20 L90 -42 L165 20" stroke="#ef4f8f" stroke-width="18"/><rect x="25" y="58" width="48" height="60" rx="8" fill="#fff"/><rect x="106" y="58" width="48" height="60" rx="8" fill="#fff"/><path d="M20 24 H160" stroke="#fff" stroke-width="12"/></g>']
    # lollipops
    for x,y,c,sc,rot in [(90,420,'#f54f94',1.0,-22),(360,300,'#58b9ed',.8,18),(1100,370,'#f3c74c',1.0,20),(1360,300,'#c968e8',.85,-15)]:
        L += [f'<g transform="translate({x} {y}) rotate({rot}) scale({sc})" filter="url(#shadow)"><rect x="-5" y="35" width="10" height="210" rx="5" fill="#fff"/><circle r="72" fill="{c}"/><path d="M-58 -32 Q0 -78 58 -32 Q0 18 -58 -32Z" fill="#fff" fill-opacity=".9"/></g>']
    # giant cupcake and gummy blocks
    L += ['<g transform="translate(720 590)" filter="url(#shadow)"><path d="M-120 20 L120 20 L80 135 H-80Z" fill="#e6a35d"/><path d="M-120 20 Q-80 -70 0 -55 Q80 -70 120 20Z" fill="#ff6b93"/><circle cx="0" cy="-28" r="18" fill="#fff"/></g>']
    for x,y,c in [(650,730,'#68d1a2'),(760,735,'#ff7ca5'),(900,760,'#7aa6f7')]:
        L += [f'<g transform="translate({x} {y})" filter="url(#shadow)"><rect x="-45" y="-45" width="90" height="90" rx="24" fill="{c}"/><circle cx="-15" cy="-12" r="10" fill="#fff" fill-opacity=".3"/><circle cx="18" cy="18" r="8" fill="#fff" fill-opacity=".18"/></g>']
    for i in range(28):
        x=random.randint(20,1420);y=random.randint(60,800)
        L += [f'<circle cx="{x}" cy="{y}" r="{random.randint(4,10)}" fill="{random.choice(["#fff","#ffd452","#ff6b9e","#64c8ef"])}" opacity=".75"/>']
    return close(L)

def draw_neon():
    L=svg_start('neon','#081026','#160326')
    # skyline
    for x,w,h,c in [(0,190,360,'#182556'),(180,140,280,'#233b7d'),(315,210,470,'#121d4d'),(525,160,320,'#1b2f66'),(690,230,520,'#221b54'),(930,160,390,'#14275c'),(1100,220,540,'#20164b'),(1320,160,420,'#162253')]:
        L += [f'<g transform="translate({x} {780-h})" filter="url(#shadow)"><rect width="{w}" height="{h}" fill="{c}"/><g opacity=".65">',
              f'<rect x="20" y="35" width="{w-40}" height="12" fill="#35e7ff"/><rect x="20" y="95" width="{w-40}" height="10" fill="#ff4f9a"/><rect x="20" y="150" width="{w-40}" height="9" fill="#6f6aff"/></g></g>']
    # street
    L += ['<path d="M0 675 H1440 V900 H0Z" fill="#090b19"/>','<path d="M720 675 L1010 900 H430 Z" fill="#11152b"/>','<path d="M720 675 L805 900 H635 Z" fill="#2f3355"/>']
    # neon signs
    for x,y,w,h,c1,c2 in [(120,470,260,120,'#ff4f9a','#35e7ff'),(1020,420,290,130,'#6f6aff','#ffd452'),(610,300,220,90,'#35e7ff','#ff4f9a')]:
        L += [f'<g transform="translate({x} {y})" filter="url(#glow)"><rect width="{w}" height="{h}" rx="18" fill="#0d1127" stroke="{c1}" stroke-width="8"/><path d="M30 {h/2} H{w-30}" stroke="{c2}" stroke-width="10"/><circle cx="{w-36}" cy="{h/2}" r="10" fill="{c1}"/></g>']
    # hover car
    L += ['<g transform="translate(760 700)" filter="url(#shadow)"><path d="M-150 40 Q-120 -45 -50 -65 H55 Q120 -40 150 40 Z" fill="#23284d" stroke="#36e7ff" stroke-width="7"/><path d="M-65 -20 H65 L95 23 H-95Z" fill="#1a2340" stroke="#ff4f9a" stroke-width="6"/><circle cx="-90" cy="45" r="28" fill="#090b19" stroke="#35e7ff" stroke-width="8"/><circle cx="90" cy="45" r="28" fill="#090b19" stroke="#ff4f9a" stroke-width="8"/></g>']
    for i in range(24):
        x=40+i*60;y=random.randint(60,300)
        L += [f'<path d="M{x} {y} h30" stroke="{random.choice(["#35e7ff","#ff4f9a","#ffd452"])}" stroke-width="4" opacity=".55"/>']
    return close(L)

def draw_spring():
    L=svg_start('spring','#8ed6f6','#d9efac')
    cloud(L,160,100,1,'#fff',.65);cloud(L,1120,120,.85,'#fff',.6)
    # rolling fields
    L += ['<path d="M0 480 Q240 340 480 500 T960 470 T1440 500 V900 H0Z" fill="#92d56a"/>','<path d="M0 610 Q260 470 540 630 T1040 600 T1440 650 V900 H0Z" fill="#72bf5a"/>']
    # blossom trees
    for x,y,s in [(170,420,1.1),(1260,430,1.2),(500,480,.85)]:
        L += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)"><path d="M0 180 Q-20 110 5 45" stroke="#79502d" stroke-width="28" fill="none"/><path d="M5 70 Q-100 40 -140 90 Q-80 105 6 94 M6 82 Q85 20 140 55 Q90 100 5 104" fill="none" stroke="#79502d" stroke-width="18"/>',
              '<circle cx="-62" cy="10" r="58" fill="#ff9dc5"/><circle cx="20" cy="-10" r="68" fill="#ff9dc5"/><circle cx="82" cy="30" r="54" fill="#ffaccf"/><circle cx="-2" cy="45" r="44" fill="#ff91b8"/></g>']
    # flowers
    for i in range(45):
        x=random.randint(20,1420);y=random.randint(640,860)
        flower(L,x,y,.45+random.random()*.35,random.choice(['#ff76a6','#ffd452','#82b7ff','#ffffff']),random.choice(['#ffd452','#f4b942']))
    # butterflies
    for x,y,c in [(340,300,'#f05d99'),(1020,320,'#5b8def'),(800,420,'#ffd452')]:
        L += [f'<g transform="translate({x} {y})"><ellipse cx="-14" cy="0" rx="20" ry="14" fill="{c}" transform="rotate(-25)"/><ellipse cx="14" cy="0" rx="20" ry="14" fill="{c}" transform="rotate(25)"/><rect x="-3" y="-14" width="6" height="28" rx="3" fill="#4d4d4d"/><path d="M0 -12 Q-18 -26 -26 -18 M0 -12 Q18 -26 26 -18" fill="none" stroke="#4d4d4d" stroke-width="3"/></g>']
    # gazebo
    L += ['<g transform="translate(760 510)" filter="url(#shadow)"><path d="M-140 0 L0 -100 L140 0 Z" fill="#fff1dc"/><rect x="-115" y="0" width="22" height="160" fill="#c08457"/><rect x="93" y="0" width="22" height="160" fill="#c08457"/><rect x="-22" y="0" width="44" height="160" fill="#c08457"/><path d="M-140 160 H140" stroke="#7c553c" stroke-width="14"/></g>']
    return close(L)

def draw_summer():
    L=svg_start('summer','#3cc8f0','#fbd48a')
    # sky clouds and sun
    cloud(L,250,120,1.05,'#fff',.65); cloud(L,1080,100,.85,'#fff',.55)
    L += ['<circle cx="1110" cy="145" r="92" fill="#ffe7a1" filter="url(#glow)"/>','<circle cx="1110" cy="145" r="120" fill="#fff2b2" opacity=".12"/>']
    # sea
    L += ['<path d="M0 465 Q200 430 420 470 T850 450 T1240 465 T1440 452 V900 H0Z" fill="#16b7ca"/>','<path d="M0 570 Q190 530 380 572 T780 560 T1170 575 T1440 560 V900 H0Z" fill="#0d9baa"/>','<path d="M0 690 Q260 650 520 700 T1020 690 T1440 705 V900 H0Z" fill="#efc56d"/>']
    for y in [500,560,620]:
        for x in range(80,1400,180):
            L += [f'<path d="M{x} {y} q35 -10 70 0" stroke="#fff" stroke-opacity=".35" stroke-width="8" fill="none" stroke-linecap="round"/>']
    palm(L,130,390,1.35);palm(L,1290,410,1.15)
    # beach umbrella and chair
    L += ['<g transform="translate(500 640)" filter="url(#shadow)"><path d="M0 0 L0 150" stroke="#76543d" stroke-width="8"/><path d="M-130 0 Q0 -95 130 0Z" fill="#f04462"/><path d="M-85 -12 Q0 -55 85 -12" stroke="#fff" stroke-width="18" fill="none"/><path d="M-130 0 H130" stroke="#8b5c3b" stroke-width="7"/></g>',
          '<g transform="translate(850 685) rotate(-6)" filter="url(#shadow)"><path d="M0 0 L140 0 L110 110 H28Z" fill="#e6c88b"/><path d="M25 16 L125 16" stroke="#fff" stroke-width="10"/><path d="M48 110 L28 160 M106 110 L128 160" stroke="#8c6949" stroke-width="9"/></g>']
    # surfboard and boat
    L += ['<g transform="translate(1040 620) rotate(14)" filter="url(#shadow)"><path d="M0 -110 Q48 -45 0 145 Q-48 -45 0 -110Z" fill="#ff6c9a"/><path d="M0 -92 V125" stroke="#fff" stroke-width="12"/><path d="M0 -40 V15" stroke="#2d8cff" stroke-width="12"/></g>',
          '<g transform="translate(1180 570)" filter="url(#shadow)"><path d="M0 30 Q85 18 170 30 L138 78 Q80 98 30 78Z" fill="#fff"/><path d="M84 30 V-90" stroke="#7e5a3a" stroke-width="7"/><path d="M86 -90 L155 -22 L90 -12Z" fill="#ff8650"/></g>']
    # beach balls
    ball(L,270,740,.75,'#fff','#333');ball(L,1210,780,.95,'#fff','#333')
    for i in range(24):
        x=random.randint(20,1420);y=random.randint(90,780)
        L += [f'<circle cx="{x}" cy="{y}" r="{random.randint(2,5)}" fill="#fff" opacity=".35"/>']
    return close(L)

def draw_autumn():
    L=svg_start('autumn','#f6be73','#8c3f2d')
    # distant hills
    L += ['<path d="M0 470 Q200 350 420 470 T820 450 T1200 470 T1440 440 V900 H0Z" fill="#b9623c"/>','<path d="M0 610 Q250 500 520 640 T1050 620 T1440 650 V900 H0Z" fill="#70412c"/>']
    # path
    L += ['<path d="M690 900 Q590 760 650 610 Q710 520 690 470 Q720 520 810 620 Q910 760 910 900Z" fill="#d29b62" opacity=".9"/>']
    # trees
    for x,y,c in [(110,360,'#e96f2c'),(320,390,'#d64a37'),(1180,380,'#f09a2d'),(1360,350,'#cf5433')]:
        L += [f'<g transform="translate({x} {y})" filter="url(#shadow)"><path d="M0 260 Q-15 130 4 40" stroke="#694027" stroke-width="34" fill="none"/><circle cx="-50" cy="35" r="72" fill="{c}"/><circle cx="38" cy="12" r="84" fill="{c}"/><circle cx="80" cy="70" r="58" fill="{c}"/><path d="M-20 130 Q0 90 28 66" stroke="#935330" stroke-width="14" fill="none"/></g>']
    # cabin
    L += ['<g transform="translate(540 545)" filter="url(#shadow)"><rect x="0" y="0" width="300" height="190" rx="10" fill="#955a3a"/><path d="M-25 25 L150 -95 L325 25 Z" fill="#6e3e2a"/><path d="M-12 12 L150 -95 L312 12" stroke="#d6a56a" stroke-width="12" fill="none"/><rect x="38" y="65" width="68" height="60" fill="#ffd86a"/><rect x="195" y="65" width="68" height="60" fill="#ffd86a"/><rect x="120" y="90" width="60" height="100" rx="10" fill="#6d432d"/></g>']
    # pumpkins
    for x,y,s in [(430,760,1),(970,760,.8),(1040,805,.7)]:
        L += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="55" ry="42" fill="#e67b2f"/><ellipse cx="-28" cy="0" rx="28" ry="40" fill="#d86524"/><ellipse cx="28" cy="0" rx="28" ry="40" fill="#d86524"/><rect x="-8" y="-49" width="16" height="16" rx="4" fill="#5d7b42"/></g>']
    # leaves
    for i in range(60):
        x=random.randint(20,1420);y=random.randint(80,820);ang=random.randint(-60,60)
        L += [f'<path d="M{x} {y} q18 -20 36 0 q-18 22 -36 0Z" fill="{random.choice(["#e6632e","#f3a32b","#c94d3a","#e8c05a"])}" transform="rotate({ang} {x} {y})" opacity=".88"/>']
    return close(L)

def draw_sports():
    L=svg_start('sports','#86c8ef','#3d7e55')
    L += ['<rect x="0" y="540" width="1440" height="360" fill="#3f8a58"/>','<ellipse cx="720" cy="720" rx="520" ry="150" fill="#2f6a42"/>','<path d="M220 720 H1220 M720 570 V870" stroke="#fff" stroke-opacity=".75" stroke-width="8"/>']
    # track
    L += ['<path d="M120 760 Q260 610 500 620 H940 Q1180 625 1320 760" fill="none" stroke="#d45454" stroke-width="90"/>','<path d="M120 760 Q260 610 500 620 H940 Q1180 625 1320 760" fill="none" stroke="#f0d7d7" stroke-width="6" stroke-dasharray="35 30"/>']
    # stadium lights
    for x in [80,1360]:
        L += [f'<g transform="translate({x} 260)" filter="url(#shadow)"><rect x="-9" y="0" width="18" height="290" fill="#556477"/><rect x="-60" y="0" width="120" height="20" rx="7" fill="#8aa1b7"/><circle cx="-34" cy="10" r="9" fill="#fff"/><circle cx="0" cy="10" r="9" fill="#fff"/><circle cx="34" cy="10" r="9" fill="#fff"/></g>']
    # podium and scoreboard
    L += ['<g transform="translate(520 430)" filter="url(#shadow)"><rect x="0" y="0" width="400" height="110" rx="16" fill="#233548"/><text x="200" y="72" text-anchor="middle" font-size="54" font-family="Montserrat,Arial" font-weight="900" fill="#fff">QUIZZO CUP</text></g>']
    # balls
    ball(L,300,620,.95,'#fff','#111');ball(L,1060,680,.85,'#f39c35','#111');
    L += ['<g transform="translate(720 760)" filter="url(#shadow)"><path d="M-120 0 H120" stroke="#fff" stroke-width="16" stroke-linecap="round"/><circle cx="-60" cy="0" r="26" fill="#ffd452"/><circle cx="60" cy="0" r="26" fill="#e85a65"/></g>']
    return close(L)

def draw_football():
    L=draw_sports()[:-2]
    # Add goal and football specifics before close
    L += ['<g transform="translate(1020 510)" filter="url(#shadow)"><path d="M0 180 V-10 H280 V180 M0 10 L280 10" fill="none" stroke="#fff" stroke-width="16"/><path d="M18 0 V180 M70 0 V180 M122 0 V180 M174 0 V180 M226 0 V180" stroke="#dceef0" stroke-width="5" opacity=".8"/></g>',
          '<g transform="translate(360 420)" filter="url(#shadow)"><path d="M0 0 Q38 -30 76 0 Q38 34 0 0Z" fill="#fff" stroke="#2f2f2f" stroke-width="5"/><path d="M38 -12 L48 2 L38 16 L25 8 L25 -6Z" fill="#111"/></g>']
    # corner flags
    for x,c in [(140,'#e63d55'),(1300,'#2d8cff')]:
        L += [f'<g transform="translate({x} 470)"><rect x="0" y="0" width="6" height="150" fill="#73573d"/><path d="M6 10 H70 L44 40 H6Z" fill="{c}"/></g>']
    return close(L)

def draw_basketball():
    L=svg_start('basketball','#89c7ed','#7c4d2f')
    L += ['<rect x="0" y="0" width="1440" height="900" fill="#9c6c47"/>','<rect x="180" y="240" width="1080" height="560" rx="40" fill="#d38a4f" stroke="#7f4b2e" stroke-width="18"/>','<path d="M720 240 V800 M240 520 H1200" stroke="#fff" stroke-width="8" opacity=".85"/>','<circle cx="720" cy="520" r="120" fill="none" stroke="#fff" stroke-width="8"/>']
    # hoops
    for x in [220,1220]:
        L += [f'<g transform="translate({x} 410)" filter="url(#shadow)"><rect x="-35" y="0" width="70" height="12" fill="#e9edf5"/><rect x="-9" y="0" width="18" height="120" fill="#737e8c"/><rect x="-55" y="80" width="110" height="14" rx="7" fill="#f15d5d"/><path d="M-40 94 Q0 160 40 94" stroke="#f15d5d" stroke-width="6" fill="none"/></g>']
    # seating
    for y,c in [(150,'#274c77'),(195,'#3d6f9e')]:
        L += [f'<path d="M40 {y} H1400" stroke="{c}" stroke-width="50" opacity=".9"/>']
    ball(L,720,600,1.2,'#ef8732','#111')
    for i in range(24):
        x=220+(i*47)%1000;y=95+((i*23)%110)
        L += [f'<circle cx="{x}" cy="{y}" r="{random.choice([3,4,5])}" fill="#fff" opacity=".22"/>']
    return close(L)

def draw_racing():
    L=svg_start('racing','#6eb5e8','#31506e')
    L += ['<rect x="0" y="0" width="1440" height="900" fill="#79b8df"/>','<path d="M0 540 Q360 430 720 560 T1440 530 V900 H0Z" fill="#4b4d53"/>','<path d="M0 650 Q360 540 720 670 T1440 640" fill="none" stroke="#fff" stroke-width="14" stroke-dasharray="55 35"/>']
    # grandstands
    for x in [40,1010]:
        L += [f'<g transform="translate({x} 280)" filter="url(#shadow)"><path d="M0 0 H330 L390 250 H-40Z" fill="#5e6875"/><path d="M20 35 H310 M15 85 H325 M0 135 H345 M-15 185 H360" stroke="#eef2f5" stroke-width="12" opacity=".65"/></g>']
    # pit boxes
    for x,c in [(420,'#e74755'),(560,'#2d8cff'),(700,'#ffd452'),(840,'#55c97d')]:
        L += [f'<g transform="translate({x} 510)" filter="url(#shadow)"><rect width="110" height="120" rx="10" fill="#e7ebef"/><rect y="0" width="110" height="18" fill="{c}"/><rect x="12" y="32" width="86" height="54" fill="#9bd1ee"/><rect x="12" y="92" width="86" height="14" fill="#69737d"/></g>']
    # formula car
    L += ['<g transform="translate(750 690)" filter="url(#shadow)"><path d="M-180 35 Q-140 -20 -70 -48 H70 Q140 -25 180 35 H105 L70 10 H-72 L-105 35Z" fill="#d92f4a"/><path d="M-95 -15 H95 L115 8 H-115Z" fill="#1f2937"/><rect x="-35" y="-46" width="70" height="30" rx="10" fill="#2b8cff"/><circle cx="-95" cy="35" r="32" fill="#17191d"/><circle cx="95" cy="35" r="32" fill="#17191d"/></g>']
    # flags
    for x,c in [(180,'#fff'),(1260,'#e53748')]:
        L += [f'<g transform="translate({x} 470)"><rect x="0" y="0" width="5" height="160" fill="#6f4d36"/><path d="M5 12 h52 v52 h-52Z" fill="{c}"/><path d="M5 12 h26 v26 h-26Z" fill="#222" opacity=".7"/></g>']
    return close(L)

def draw_gaming():
    L=svg_start('gaming','#1a0e3c','#040615')
    # room panels
    L += ['<rect x="0" y="0" width="1440" height="900" fill="#0a0b18"/>','<path d="M0 560 H1440 V900 H0Z" fill="#0f1326"/>','<path d="M720 0 L980 900 H460 Z" fill="#172047" opacity=".5"/>']
    # giant controllers as decals
    for x,y,c in [(230,250,'#5b8cff'),(1180,280,'#ff5d9b')]:
        L += [f'<g transform="translate({x} {y}) rotate({(x%40)-20})" filter="url(#shadow)"><path d="M-120 50 Q-145 -5 -90 -42 H90 Q145 -5 120 50 L78 100 H44 L20 60 H-20 L-44 100 H-78Z" fill="#252b54" stroke="{c}" stroke-width="9"/><circle cx="-45" cy="5" r="12" fill="{c}"/><circle cx="45" cy="-10" r="9" fill="#ffd452"/><circle cx="67" cy="10" r="9" fill="#55cf89"/></g>']
    # desk + dual monitors
    L += ['<g transform="translate(510 515)" filter="url(#shadow)"><rect x="0" y="0" width="420" height="28" rx="8" fill="#6337a4"/><rect x="180" y="28" width="55" height="210" fill="#242b4d"/><rect x="40" y="-150" width="150" height="120" rx="12" fill="#161b31" stroke="#54d4ff" stroke-width="7"/><rect x="230" y="-150" width="150" height="120" rx="12" fill="#161b31" stroke="#ff5d9b" stroke-width="7"/><path d="M55 -118 H175 M245 -118 H365" stroke="#9b80ff" stroke-width="10"/></g>']
    # floor tiles
    for x in range(0,1440,120):
        L += [f'<path d="M720 620 L{x} 900" stroke="#26315d" stroke-width="3" opacity=".5"/>']
    for y in [680,750,820]:
        L += [f'<path d="M0 {y} H1440" stroke="#26315d" stroke-width="3" opacity=".5"/>']
    # pixel blocks and lights
    for i in range(34):
        x=random.randint(30,1410);y=random.randint(40,470);s=random.randint(8,26);c=random.choice(['#52d8ff','#ff5d9b','#8f6bff','#ffd452'])
        L += [f'<rect x="{x}" y="{y}" width="{s*2}" height="{s*2}" rx="{s/3}" fill="{c}" opacity=".7" filter="url(#glow)"/>']
    return close(L)

def draw_music():
    L=svg_start('music','#6e35a7','#180b2f')
    # stage
    L += ['<rect x="0" y="0" width="1440" height="900" fill="#1b1030"/>','<path d="M0 570 H1440 V900 H0Z" fill="#140d25"/>','<path d="M0 0 L350 900" stroke="#3ff4e6" stroke-width="120" opacity=".08"/><path d="M1440 0 L1090 900" stroke="#ff55bf" stroke-width="120" opacity=".08"/>']
    # truss
    L += ['<path d="M180 150 H1260 M180 150 V510 M1260 150 V510" stroke="#7e8394" stroke-width="20"/>']
    for x,c in [(260,'#ff4f9a'),(450,'#52d8ff'),(720,'#ffd452'),(990,'#6f6aff'),(1180,'#56d687')]:
        L += [f'<g transform="translate({x} 165)" filter="url(#glow)"><path d="M0 0 L{-70 if x<720 else 70} 320 H{70 if x<720 else -70}Z" fill="{c}" opacity=".18"/><circle r="30" fill="{c}"/></g>']
    # speakers
    for x in [140,1180]:
        L += [f'<g transform="translate({x} 540)" filter="url(#shadow)"><rect x="0" y="0" width="120" height="220" rx="16" fill="#2b2937"/><circle cx="60" cy="70" r="32" fill="#111" stroke="#5fd8ff" stroke-width="6"/><circle cx="60" cy="150" r="45" fill="#111" stroke="#ff5d9b" stroke-width="6"/></g>']
    # mic
    L += ['<g transform="translate(720 550)" filter="url(#shadow)"><rect x="-18" y="0" width="36" height="170" rx="18" fill="#d0d7e5"/><ellipse cx="0" cy="0" rx="48" ry="64" fill="#31384c"/><path d="M-32 -16 H32 M-38 5 H38 M-32 26 H32" stroke="#7ecaff" stroke-width="6"/><path d="M0 170 L-70 220 H70Z" fill="#252a3d"/></g>']
    # note particles
    notes=['♪','♫','♬','♩']
    for i in range(28):
        x=random.randint(40,1400);y=random.randint(80,760);s=random.randint(18,40);c=random.choice(['#ff5d9b','#56d7ff','#ffd452','#8d7aff'])
        # use text with common font; safe-ish for preview
        L += [f'<text x="{x}" y="{y}" font-size="{s}" font-family="Arial" font-weight="700" fill="{c}" opacity=".7">{random.choice(notes)}</text>']
    return close(L)

def draw_halloween():
    L=svg_start('halloween','#120d25','#35132f')
    L += ['<circle cx="1080" cy="150" r="78" fill="#f8d66a"/><circle cx="1105" cy="130" r="78" fill="#24102d"/>','<path d="M0 590 Q260 500 520 600 T1020 580 T1440 600 V900 H0Z" fill="#211524"/>']
    # haunted houses
    for x in [90,1030]:
        L += [f'<g transform="translate({x} 420)" filter="url(#shadow)"><rect x="0" y="0" width="260" height="230" fill="#25192e"/><path d="M-30 25 L130 -115 L290 25 Z" fill="#17111f"/><path d="M70 70 H190 V185 H70Z" fill="#0c0810"/><circle cx="112" cy="108" r="12" fill="#ff8c3f"/><circle cx="148" cy="108" r="12" fill="#ff8c3f"/><rect x="18" y="55" width="38" height="46" fill="#ff9a46" opacity=".6"/></g>']
    # pumpkins
    for x,y,s in [(400,735,1),(520,785,.75),(870,760,1.1),(1180,800,.8)]:
        L += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="58" ry="42" fill="#ee772b"/><ellipse cx="-32" cy="0" rx="28" ry="40" fill="#d85f24"/><ellipse cx="32" cy="0" rx="28" ry="40" fill="#d85f24"/><path d="M-25 -4 L-6 -12 L-14 5 M25 -4 L6 -12 L14 5 M-22 18 Q0 36 22 18" stroke="#24110d" stroke-width="8" fill="none"/><rect x="-7" y="-52" width="14" height="14" fill="#4b7a44"/></g>']
    # bats and ghost
    for x,y,s in [(300,180,1),(760,220,.8),(1270,210,1.1)]:
        L += [f'<path d="M{x} {y} q-45 -30 -72 4 q30 -4 43 30 q15 -23 29 -6 q14 -17 29 6 q12 -34 42 -30 q-27 -34 -71 -4Z" fill="#0a0710"/>']
    L += ['<g transform="translate(710 520)" filter="url(#shadow)"><path d="M0 145 Q-74 115 -58 5 Q-50 -72 0 -92 Q50 -72 58 5 Q74 115 0 145Z" fill="#f6f7f1"/><circle cx="-20" cy="-32" r="10" fill="#222"/><circle cx="20" cy="-32" r="10" fill="#222"/><path d="M-26 10 Q0 36 26 10" fill="none" stroke="#222" stroke-width="7"/></g>']
    # graveyard
    for x in [160,210,1260,1320]:
        L += [f'<g transform="translate({x} 690)"><path d="M0 55 V0 Q30 -20 60 0 V55Z" fill="#4d4353"/><path d="M30 2 V45 M12 24 H48" stroke="#201622" stroke-width="7"/></g>']
    return close(L)

def draw_party():
    L=svg_start('party','#8133a9','#20103d')
    L += ['<rect width="1440" height="900" fill="#211137"/>','<path d="M0 0 L300 900" stroke="#ff4f9a" stroke-width="160" opacity=".10"/><path d="M1440 0 L1140 900" stroke="#49d7ff" stroke-width="160" opacity=".10"/>']
    balloons(L,190,180,1.0);balloons(L,1240,160,.9)
    # disco ball
    L += ['<g transform="translate(720 180)" filter="url(#glow)"><circle r="95" fill="#c6d0de"/><path d="M-75 -10 H75 M-60 35 H60 M-45 -55 H45 M0 -95 V95 M-45 55 H45" stroke="#fff" stroke-width="9" opacity=".7"/><path d="M-120 260 L0 0 L120 260" fill="#ff4f9a" opacity=".12"/></g>']
    # tables, cake, lights
    for x in [230,500,940,1210]:
        L += [f'<g transform="translate({x} 610)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="120" ry="34" fill="#724c46"/><path d="M-82 18 L-96 170 M82 18 L96 170" stroke="#4d3d40" stroke-width="14"/></g>']
    L += ['<g transform="translate(720 610)" filter="url(#shadow)"><rect x="-90" y="-40" width="180" height="90" rx="16" fill="#ff82b3"/><rect x="-72" y="-85" width="144" height="55" rx="12" fill="#fff0fb"/><path d="M-50 -85 V-120 M0 -85 V-120 M50 -85 V-120" stroke="#ffd452" stroke-width="10"/><circle cx="-50" cy="-126" r="10" fill="#ff7c5d"/><circle cx="0" cy="-126" r="10" fill="#59d7ff"/><circle cx="50" cy="-126" r="10" fill="#61cf7e"/></g>']
    # confetti
    for i in range(90):
        x=random.randint(0,1430);y=random.randint(30,820);w=random.randint(8,22);h=random.randint(5,15);c=random.choice(['#ff4f9a','#ffd452','#49d7ff','#66db7a','#a77bff'])
        L += [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{c}" transform="rotate({random.randint(-55,55)} {x} {y})" opacity=".78"/>']
    return close(L)

def draw_rainbow():
    L=svg_start('rainbow','#75c6ef','#b5e9ff')
    cloud(L,180,150,1.2,'#fff',.8);cloud(L,1190,140,1.0,'#fff',.75)
    # rainbow arcs
    for r,c in [(430,'#ed4c63'),(390,'#f6a728'),(350,'#63ca63'),(310,'#53a8ef'),(270,'#8a6ee8')]:
        L += [f'<circle cx="720" cy="790" r="{r}" fill="none" stroke="{c}" stroke-width="34" opacity=".95"/>']
    # cloud masking
    L += ['<path d="M0 790 Q80 720 220 790 H1220 Q1340 720 1440 790 V900 H0Z" fill="#f4f9ff"/>']
    # floating islands
    for x,y,s,c in [(280,500,1,'#7bc56b'),(1120,510,.9,'#6abb61'),(720,390,.75,'#86d26e')]:
        L += [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="110" ry="38" fill="{c}"/><path d="M-80 12 L0 150 L80 12" fill="#927653"/><path d="M-70 -6 Q0 -55 70 -6" fill="#8fd574"/><rect x="-18" y="-55" width="36" height="48" rx="8" fill="#d8c28e"/></g>']
    # tiny castle
    L += ['<g transform="translate(695 205)" filter="url(#shadow)"><rect x="0" y="0" width="100" height="80" fill="#f2e7d7"/><rect x="-20" y="-25" width="25" height="55" fill="#edd9bd"/><rect x="95" y="-25" width="25" height="55" fill="#edd9bd"/><path d="M-25 -25 L-7 -60 L10 -25 M90 -25 L108 -60 L125 -25" fill="#d65b70"/></g>']
    # stars and sparkles
    for i in range(35):
        x=random.randint(30,1410);y=random.randint(70,760);r=random.randint(4,10)
        L += [f'<path d="M{x} {y-r*2} L{x+r/2} {y-r/2} L{x+r*2} {y} L{x+r/2} {y+r/2} L{x} {y+r*2} L{x-r/2} {y+r/2} L{x-r*2} {y} L{x-r/2} {y-r/2}Z" fill="#fff1a4" opacity=".7"/>']
    return close(L)

def draw_arcade():
    L=svg_start('arcade','#102a65','#070b20')
    L += ['<rect width="1440" height="900" fill="#0c1331"/>','<path d="M0 620 H1440 V900 H0Z" fill="#121a38"/>']
    # tiled floor
    for x in range(-20,1460,120): L += [f'<path d="M720 560 L{x} 900" stroke="#37426c" stroke-width="5"/>']
    for y in [660,740,820]: L += [f'<path d="M0 {y} H1440" stroke="#37426c" stroke-width="5"/>']
    # machines
    for i,x in enumerate([70,260,450,640,830,1020,1210]):
        c=['#43d4ff','#ff557f','#ffd452','#7d6dff'][i%4]
        L += [f'<g transform="translate({x} 360)" filter="url(#shadow)"><path d="M0 220 L0 20 Q0 0 20 0 H120 Q140 0 140 20 V220Z" fill="#242a4a" stroke="{c}" stroke-width="8"/><rect x="22" y="35" width="96" height="74" rx="8" fill="#121728"/><path d="M35 60 H105 M48 82 H92" stroke="{c}" stroke-width="8"/><circle cx="55" cy="150" r="14" fill="#e74f71"/><circle cx="92" cy="150" r="14" fill="#58cf7e"/><rect x="56" y="180" width="30" height="28" rx="5" fill="#ffd452"/></g>']
    # pinball
    L += ['<g transform="translate(610 690) rotate(-8)" filter="url(#shadow)"><rect x="-150" y="-90" width="300" height="180" rx="16" fill="#9c4169" stroke="#fff" stroke-width="7"/><circle cx="-70" cy="-20" r="18" fill="#ffd452"/><circle cx="55" cy="10" r="25" fill="#56caff"/><circle cx="0" cy="65" r="12" fill="#fff"/></g>']
    # tokens
    for i in range(22):
        x=random.randint(30,1410);y=random.randint(100,800)
        L += [f'<circle cx="{x}" cy="{y}" r="{random.randint(7,12)}" fill="none" stroke="{random.choice(["#ffd452","#43d4ff","#ff557f"])}" stroke-width="4" opacity=".75"/>']
    return close(L)

def draw_volcano():
    L=svg_start('volcano','#f47a3e','#2a0d15')
    L += ['<rect width="1440" height="900" fill="#2c1015"/>','<path d="M0 620 Q180 520 360 630 T720 615 T1080 630 T1440 620 V900 H0Z" fill="#1c1017"/>']
    # volcano body
    L += ['<path d="M360 900 L710 265 L1080 900Z" fill="#493135" filter="url(#shadow)"/><path d="M520 900 L710 360 L910 900Z" fill="#31272e"/>','<path d="M650 440 Q700 500 710 620 T810 850" stroke="#ff6b21" stroke-width="45" fill="none" opacity=".85"/><path d="M690 425 Q710 520 730 610 T800 830" stroke="#ffd452" stroke-width="17" fill="none"/>']
    # lava river
    L += ['<path d="M710 280 Q650 360 695 430 Q750 500 660 590 Q540 690 480 900" stroke="#ff6a20" stroke-width="90" fill="none" opacity=".9"/>','<path d="M710 280 Q680 360 720 430 Q770 500 690 580 Q600 690 530 900" stroke="#ffd452" stroke-width="28" fill="none"/>']
    # smoke
    for x,y,r in [(710,220,90),(650,150,70),(780,120,80),(610,90,48),(830,70,52)]:
        L += [f'<circle cx="{x}" cy="{y}" r="{r}" fill="#6c6b76" opacity=".45" filter="url(#soft)"/>']
    # rocks
    for x,y,s in [(140,770,1),(300,820,.8),(1100,790,1.1),(1300,730,.75)]:
        L += [f'<path d="M{x-50*s} {y+50*s} L{x-20*s} {y-50*s} L{x+45*s} {y-25*s} L{x+55*s} {y+45*s} Z" fill="#55434a"/>']
    # ash sparks
    for i in range(60):
        x=random.randint(400,1040);y=random.randint(90,620);r=random.choice([2,3,4]);
        L += [f'<circle cx="{x}" cy="{y}" r="{r}" fill="{random.choice(["#ffd452","#ff8b32","#fff0b2"])}" opacity=".75"/>']
    return close(L)

def draw_study():
    L=svg_start('study','#c9b092','#6d4e37')
    L += ['<rect width="1440" height="900" fill="#c9b092"/>','<rect x="0" y="0" width="1440" height="530" fill="#d7c6ad"/>','<path d="M0 530 H1440" stroke="#9a7652" stroke-width="18"/>']
    # window
    L += ['<g transform="translate(1060 95)" filter="url(#shadow)"><rect width="270" height="260" rx="12" fill="#825e45"/><rect x="20" y="20" width="230" height="220" fill="#8ac5df"/><path d="M135 20 V240 M20 130 H250" stroke="#fff6e6" stroke-width="14"/><circle cx="78" cy="72" r="18" fill="#fff" opacity=".6"/><path d="M38 205 Q140 150 220 205" stroke="#fff" stroke-width="7" fill="none" opacity=".5"/></g>']
    # desk
    L += ['<g transform="translate(150 560)" filter="url(#shadow)"><rect width="970" height="50" rx="12" fill="#7d5134"/><path d="M80 50 V330 M890 50 V330" stroke="#5e3f2d" stroke-width="24"/><rect x="300" y="-110" width="300" height="170" rx="16" fill="#2e3542"/><rect x="320" y="-90" width="260" height="130" rx="10" fill="#a7d8dc"/></g>']
    # books stack
    colors=['#e35e67','#5d8df5','#ffd452','#62bd7a','#9f6ce8']
    for i,c in enumerate(colors):
        L += [f'<rect x="280" y="650" width="{220- i*15}" height="34" rx="5" fill="{c}" filter="url(#shadow)"/>']
    # lamp
    L += ['<g transform="translate(900 450)" filter="url(#shadow)"><path d="M0 200 V80 L80 -20" stroke="#5b4b43" stroke-width="12" fill="none"/><path d="M65 -45 L150 -45 L112 20 H35Z" fill="#f7db74"/><ellipse cx="92" cy="-25" rx="66" ry="30" fill="#fff1aa" opacity=".18" filter="url(#soft)"/></g>']
    # plant
    L += ['<g transform="translate(1280 560)" filter="url(#shadow)"><path d="M0 130 Q0 65 8 0" stroke="#7d5d3c" stroke-width="10" fill="none"/><ellipse cx="-34" cy="25" rx="45" ry="18" fill="#4e9b55" transform="rotate(-25)"/><ellipse cx="36" cy="50" rx="45" ry="18" fill="#5cad60" transform="rotate(24)"/><path d="M-28 128 H48" stroke="#825639" stroke-width="18"/></g>']
    # papers and pencil
    L += ['<g transform="translate(520 710) rotate(-5)" filter="url(#shadow)"><rect width="260" height="150" rx="10" fill="#fffef8"/><path d="M30 42 H215 M30 75 H200 M30 108 H175" stroke="#b8b0a5" stroke-width="7"/></g>',
          '<g transform="translate(550 800) rotate(-18)"><path d="M0 0 H220" stroke="#f2bf4e" stroke-width="18"/><path d="M220 0 L245 0 L222 10Z" fill="#d58d45"/></g>']
    # shelves and books
    L += ['<g transform="translate(90 120)" filter="url(#shadow)"><rect width="220" height="330" fill="#7c563d"/><rect x="18" y="18" width="184" height="90" fill="#4b3b31"/><rect x="18" y="120" width="184" height="90" fill="#4b3b31"/><rect x="18" y="222" width="184" height="90" fill="#4b3b31"/>']
    for yy in [35,137,239]:
        for j in range(5):
            c=colors[(j+yy)%len(colors)];L += [f'<rect x="{35+j*30}" y="{yy}" width="22" height="66" rx="4" fill="{c}"/>']
    L += ['</g>']
    return close(L)

# preserve v16 sunset and classic. Replace all other scenes with detailed ones.
SCENES={
 'winter':draw_winter,'christmas':draw_christmas,'classroom':draw_classroom,'ocean':draw_ocean,'space':draw_space,'jungle':draw_jungle,'candy':draw_candy,'neon':draw_neon,'spring':draw_spring,'summer':draw_summer,'autumn':draw_autumn,'sports':draw_sports,'football':draw_football,'basketball':draw_basketball,'racing':draw_racing,'gaming':draw_gaming,'music':draw_music,'halloween':draw_halloween,'party':draw_party,'rainbow':draw_rainbow,'arcade':draw_arcade,'volcano':draw_volcano,'study':draw_study}

# ensure sunset remains the already accepted design
old_sunset = ROOT/'sunset.svg'
for name,fn in SCENES.items():
    p=ROOT/f'{name}.svg'
    lines=fn()
    p.write_text('\n'.join(lines),encoding='utf-8')

print('Generated', len(SCENES), 'detailed SVG backgrounds')
for p in ROOT.glob('*.svg'):
    if p.stem!='sunset':
        print(p.stem, len(p.read_text().splitlines()), 'lines', p.stat().st_size, 'bytes')
