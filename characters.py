from pathlib import Path
import random
ROOT=Path('/mnt/data/quizzo_v17_work/themes')
random.seed(777)

def append(name, lines):
    p=ROOT/f'{name}.svg'
    s=p.read_text(encoding='utf-8').replace('</svg>','\n'+'\n'.join(lines)+'\n</svg>')
    p.write_text(s,encoding='utf-8')

def person(x,y,s=1,skin='#f5c7a4',shirt='#ff5b67',pants='#2d5aa7',hair='#4b3027',accent='#ffd452',flip=1,pose=0):
    # deliberately verbose multi-element character, 2.5D toy-like rather than photorealistic
    lines=[f'<g transform="translate({x} {y}) scale({s*flip} {s})" filter="url(#shadow)">',
    '<ellipse cx="0" cy="172" rx="66" ry="16" fill="#101522" opacity=".25"/>',
    '<path d="M-42 65 Q0 35 42 65 L58 142 Q0 171 -58 142Z" fill="%s" stroke="#fff" stroke-opacity=".18" stroke-width="4"/>'%shirt,
    '<path d="M-18 135 L-60 205" stroke="%s" stroke-width="20" stroke-linecap="round"/>'%pants,
    '<path d="M18 135 L60 205" stroke="%s" stroke-width="20" stroke-linecap="round"/>'%pants,
    '<ellipse cx="-64" cy="210" rx="22" ry="10" fill="#222a35"/><ellipse cx="64" cy="210" rx="22" ry="10" fill="#222a35"/>',
    '<path d="M-42 82 Q-82 108 -97 139" stroke="%s" stroke-width="14" stroke-linecap="round"/><path d="M42 82 Q82 108 97 139" stroke="%s" stroke-width="14" stroke-linecap="round"/>'%(skin,skin),
    '<circle cx="0" cy="16" r="52" fill="%s" stroke="#fff" stroke-opacity=".25" stroke-width="4"/>'%skin,
    '<path d="M-47 0 Q0 -53 47 0 Q18 -15 -18 -10Z" fill="%s"/>'%hair,
    '<circle cx="-18" cy="20" r="5" fill="#23303a"/><circle cx="18" cy="20" r="5" fill="#23303a"/>',
    '<path d="M-15 43 Q0 54 15 43" stroke="#6b4038" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<path d="M-35 83 Q0 97 35 83" stroke="%s" stroke-width="10" fill="none"/>'%accent,
    ]
    if pose==1:
        lines += ['<path d="M42 78 Q92 40 128 60" stroke="%s" stroke-width="14" stroke-linecap="round"/>'%skin,
                  '<circle cx="132" cy="57" r="9" fill="%s"/>'%skin]
    elif pose==2:
        lines += ['<path d="M-42 78 Q-95 45 -125 70" stroke="%s" stroke-width="14" stroke-linecap="round"/>'%skin,
                  '<path d="M-134 68 l18 -9 l-7 19" fill="%s"/>'%accent]
    lines.append('</g>')
    return lines

def robot(x,y,s=1,c='#58d9ff',accent='#ff5d9b'):
    return [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',
            '<ellipse cx="0" cy="190" rx="80" ry="17" fill="#000" opacity=".25"/>',
            f'<rect x="-62" y="15" width="124" height="108" rx="28" fill="#3a4263" stroke="{c}" stroke-width="8"/>',
            f'<rect x="-48" y="-82" width="96" height="98" rx="24" fill="#2b314d" stroke="{c}" stroke-width="8"/>',
            f'<circle cx="-20" cy="-35" r="11" fill="{accent}"/><circle cx="20" cy="-35" r="11" fill="{accent}"/>',
            '<path d="M-22 -5 Q0 10 22 -5" stroke="#fff" stroke-width="6" fill="none"/>',
            '<path d="M-62 48 L-110 90 M62 48 L110 20" stroke="#465174" stroke-width="20" stroke-linecap="round"/>',
            '<circle cx="-112" cy="90" r="14" fill="#ffd452"/><circle cx="110" cy="20" r="14" fill="#ffd452"/>',
            '<path d="M-30 123 L-44 190 M30 123 L44 190" stroke="#465174" stroke-width="24" stroke-linecap="round"/>',
            f'<rect x="-18" y="-116" width="36" height="24" rx="10" fill="{accent}"/>',
            '</g>']

def fish3d(x,y,s,c='#ff7f50'):
    return [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">',f'<ellipse rx="62" ry="35" fill="{c}" stroke="#fff" stroke-opacity=".18" stroke-width="4"/>',f'<path d="M46 0 L86 -34 L86 34Z" fill="{c}"/>','<circle cx="-25" cy="-8" r="7" fill="#fff"/><circle cx="-25" cy="-8" r="3" fill="#222"/>','<path d="M-12 25 Q10 8 35 26" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>','</g>']

def snowman3d(x,y,s=1):
    return [f'<g transform="translate({x} {y}) scale({s})" filter="url(#shadow)">','<ellipse cx="0" cy="185" rx="78" ry="16" fill="#000" opacity=".2"/>','<circle cy="105" r="74" fill="#fff" stroke="#dfe8f0" stroke-width="6"/>','<circle cy="30" r="54" fill="#fff" stroke="#dfe8f0" stroke-width="6"/>','<circle cy="-35" r="39" fill="#fff" stroke="#dfe8f0" stroke-width="5"/>','<rect x="-46" y="-82" width="92" height="18" rx="8" fill="#2f3b54"/>','<rect x="-30" y="-125" width="60" height="45" rx="8" fill="#2f3b54"/>','<circle cx="-14" cy="-40" r="5" fill="#222"/><circle cx="14" cy="-40" r="5" fill="#222"/>','<path d="M0 -27 L35 -14 L0 -4Z" fill="#f08a31"/>','<path d="M-20 2 Q0 15 20 2" fill="none" stroke="#222" stroke-width="5"/>','<path d="M-42 78 Q-90 50 -114 15 M42 78 Q90 50 114 15" stroke="#70452c" stroke-width="10" stroke-linecap="round"/>','<circle cy="65" r="6" fill="#2b3444"/><circle cy="100" r="6" fill="#2b3444"/><circle cy="135" r="6" fill="#2b3444"/>','</g>']

def theme_pack(theme):
    L=[f'<!-- {theme.upper()}: detailed character and prop pass for a hand-designed 3D game background -->']
    if theme=='winter':
        L+=snowman3d(1180,560,1.0)+person(270,575,1.05,'#f2c4a3','#e94762','#365b92','#57392f','#fff',pose=1)
        L+=['<g transform="translate(80 700)" filter="url(#shadow)"><path d="M0 120 Q80 0 160 120Z" fill="#74a6c9"/><path d="M30 90 Q80 35 130 90" stroke="#fff" stroke-width="18" fill="none"/><path d="M80 10 V130" stroke="#814c32" stroke-width="9"/></g>',
             '<g transform="translate(920 690)" filter="url(#shadow)"><path d="M0 75 Q100 35 180 75" stroke="#7d5a46" stroke-width="16" fill="none"/><path d="M20 76 L-5 115 M150 76 L180 115" stroke="#704a38" stroke-width="9"/><path d="M20 76 Q100 105 180 76" stroke="#dceaf7" stroke-width="12"/></g>']
    elif theme=='christmas':
        L+=person(280,560,1.0,'#efc2a2','#d93c4f','#305a90','#4b2d28','#ffd452',pose=1)
        # Santa-like second figure without facial identity
        L+=person(1180,560,1.0,'#f0c2a1','#d73b42','#5f3d36','#2f2a25','#fff',pose=2)
        L+=['<g transform="translate(290 450)"><path d="M-65 -5 Q0 -75 65 -5" stroke="#fff" stroke-width="22" fill="none"/><path d="M-65 -8 Q0 -82 65 -8" stroke="#d63e47" stroke-width="16" fill="none"/></g>',
             '<g transform="translate(1170 700)" filter="url(#shadow)"><rect width="170" height="90" rx="12" fill="#2e8d56"/><path d="M0 20 H170 M0 45 H170 M0 70 H170" stroke="#fff" stroke-width="7" opacity=".8"/></g>']
    elif theme=='classroom':
        L+=person(310,530,.95,'#f0bd9d','#4d83d9','#5a4a3d','#6b422b','#ffd452',pose=1)+person(1180,530,.92,'#d99c77','#59bd78','#324f8c','#382a24','#fff',pose=2)
        L+=['<g transform="translate(350 250)" filter="url(#shadow)"><rect width="220" height="120" rx="12" fill="#e8d09f"/><path d="M30 42 H190 M30 70 H170" stroke="#6b5b4d" stroke-width="8"/><text x="30" y="105" font-size="24" font-family="Arial" font-weight="900" fill="#6b5b4d">1 + 1 = 2</text></g>',
             '<g transform="translate(850 260)" filter="url(#shadow)"><rect width="160" height="115" rx="10" fill="#e5eaf0"/><circle cx="80" cy="55" r="36" fill="#61a8d7"/><path d="M48 55 H112 M80 24 V86" stroke="#f1f6fa" stroke-width="7"/></g>']
    elif theme=='ocean':
        # diver
        L+=person(260,500,1.0,'#dba883','#ffb347','#3b4e9c','#2f3244','#57d8ef',pose=1)+fish3d(1180,520,1.1,'#ff6b78')+fish3d(1020,660,.8,'#ffd452')
        L+=['<g transform="translate(610 690)" filter="url(#shadow)"><path d="M0 0 L90 -80 L180 0Z" fill="#8b603d"/><rect x="52" y="-15" width="76" height="56" rx="8" fill="#7ac9ed"/><path d="M65 10 H115" stroke="#fff" stroke-width="6"/></g>']
    elif theme=='space':
        L+=person(250,565,1.0,'#f1c2a4','#f1f2f7','#4f5e86','#4a312e','#ff5d9b',pose=1)+person(1190,540,.95,'#d49d79','#3fd1cc','#313d67','#3f2f26','#ffd452',pose=2)
        L+=['<g transform="translate(620 690)" filter="url(#shadow)"><path d="M0 80 Q75 -30 150 80Z" fill="#c5d5e9"/><rect x="58" y="20" width="34" height="55" rx="12" fill="#61c9ef"/><path d="M75 -5 V-62" stroke="#cbd5e8" stroke-width="7"/><circle cx="75" cy="-70" r="9" fill="#ff5d9b"/></g>']
    elif theme=='jungle':
        L+=person(250,560,1.0,'#d69a75','#3e9d61','#725138','#3e3026','#ffd452',pose=1)+person(1190,560,.92,'#f0c09e','#d55c63','#3d5d93','#3f2f28','#62d18a',pose=2)
        L+=['<g transform="translate(820 680)" filter="url(#shadow)"><path d="M0 140 L100 0 L200 140Z" fill="#927454"/><rect x="58" y="64" width="84" height="76" rx="12" fill="#6f4e3a"/><path d="M72 84 H128" stroke="#ffd452" stroke-width="10"/></g>']
    elif theme=='candy':
        L+=person(260,570,.98,'#efc1a3','#f05c9b','#6c52ad','#503127','#ffd452',pose=1)
        # gummy-style second figure
        L+=['<g transform="translate(1180 610)" filter="url(#shadow)"><ellipse cx="0" cy="70" rx="72" ry="18" fill="#000" opacity=".2"/><rect x="-58" y="-25" width="116" height="125" rx="48" fill="#6dd4a5"/><circle cx="-20" cy="15" r="7" fill="#242a3a"/><circle cx="20" cy="15" r="7" fill="#242a3a"/><path d="M-18 45 Q0 58 18 45" stroke="#244234" stroke-width="6" fill="none"/></g>']
    elif theme=='neon':
        L+=robot(250,540,1.0,'#35e7ff','#ff4f9a')+robot(1180,560,.95,'#ff5d9b','#ffd452')
        L+=['<g transform="translate(500 700)" filter="url(#glow)"><path d="M0 100 H330" stroke="#35e7ff" stroke-width="11"/><path d="M40 100 L100 15 H260 L320 100" fill="#121830" stroke="#ff4f9a" stroke-width="6"/><circle cx="110" cy="105" r="26" fill="#111" stroke="#35e7ff" stroke-width="7"/><circle cx="250" cy="105" r="26" fill="#111" stroke="#ff4f9a" stroke-width="7"/></g>']
    elif theme=='spring':
        L+=person(250,570,.96,'#f0bd9c','#ff8bb5','#5a7c54','#5a382b','#ffd452',pose=1)+person(1190,565,.92,'#d49b7d','#5fc4a1','#455f9a','#4c3029','#fff',pose=2)
        L+=['<g transform="translate(720 665)" filter="url(#shadow)"><path d="M0 120 Q40 0 80 120" stroke="#7d593b" stroke-width="10" fill="none"/><path d="M0 45 Q45 10 90 45" stroke="#ef83aa" stroke-width="22" fill="none"/><path d="M5 90 Q45 50 85 90" stroke="#ffd452" stroke-width="17" fill="none"/></g>']
    elif theme=='summer':
        L+=person(240,555,1.0,'#d9a07b','#54c6e9','#345d8e','#4a2f28','#ffd452',pose=1)+person(1190,565,.92,'#efc3a3','#ff6c9a','#4c8b76','#3f2f2a','#fff',pose=2)
        L+=['<g transform="translate(700 690)" filter="url(#shadow)"><circle cx="0" cy="0" r="70" fill="#fff" stroke="#ef626d" stroke-width="12"/><path d="M0 -70 V70 M-70 0 H70" stroke="#2d8cff" stroke-width="8"/></g>',
            '<g transform="translate(1030 755) rotate(-8)" filter="url(#shadow)"><path d="M0 60 H200 Q185 90 100 110 Q20 90 0 60Z" fill="#fff"/><path d="M90 60 V-70" stroke="#6e4b36" stroke-width="7"/><path d="M92 -70 L155 -4 L96 -10Z" fill="#ff7f55"/></g>']
    elif theme=='autumn':
        L+=person(250,570,.98,'#d89f7e','#e77d2d','#5b513d','#493126','#ffd452',pose=1)+person(1185,565,.93,'#f0bd9c','#c94e3a','#455d86','#3d2e28','#fff',pose=2)
        L+=['<g transform="translate(700 720)" filter="url(#shadow)"><rect width="230" height="22" rx="10" fill="#7a4a32"/><path d="M28 22 V110 M202 22 V110" stroke="#5d3c2b" stroke-width="12"/></g>',
            '<g transform="translate(1050 720)" filter="url(#shadow)"><path d="M0 95 Q40 0 82 95Z" fill="#d86c2d"/><path d="M25 30 Q42 4 58 30" stroke="#fff" stroke-opacity=".35" stroke-width="7" fill="none"/></g>']
    elif theme=='sports':
        L+=person(245,565,.98,'#dca581','#55c26f','#2d6ca3','#312b29','#ffd452',pose=1)+person(1190,565,.95,'#f2c4a4','#e75b62','#3a3a5f','#40302a','#fff',pose=2)
        L+=['<g transform="translate(610 690)" filter="url(#shadow)"><rect width="220" height="105" rx="14" fill="#223548"/><text x="110" y="66" text-anchor="middle" font-size="48" font-family="Arial" font-weight="900" fill="#fff">1000</text></g>']
    elif theme=='football':
        L+=person(245,565,.98,'#dca580','#2d8cff','#fff','#322b28','#ffd452',pose=1)+person(1185,565,.95,'#efc1a1','#e74250','#2c3f74','#3b2f28','#fff',pose=2)
        L+=['<g transform="translate(700 690)" filter="url(#shadow)"><circle r="54" fill="#fff"/><path d="M-24 -4 L-5 -28 L24 -17 L30 12 L2 30 L-26 17Z" fill="#111"/><path d="M-5 -28 L-2 -55 M30 12 L56 32 M-26 17 L-50 38" stroke="#111" stroke-width="7"/></g>']
    elif theme=='basketball':
        L+=person(250,570,.98,'#c88d6c','#ef7f31','#3a6c9e','#302827','#ffd452',pose=1)+person(1180,560,.95,'#e2ae8c','#59a9e8','#d06b31','#4a3026','#fff',pose=2)
        L+=['<g transform="translate(720 700)" filter="url(#shadow)"><circle r="56" fill="#f08b31"/><path d="M-56 0 H56 M0 -56 V56" stroke="#6e3b22" stroke-width="8"/><path d="M-46 -36 Q0 -58 46 -36 M-46 36 Q0 58 46 36" stroke="#6e3b22" stroke-width="8" fill="none"/></g>']
    elif theme=='racing':
        L+=person(235,555,.98,'#efc4a3','#e94358','#283849','#372b2a','#ffd452',pose=1)+robot(1190,560,.85,'#d6dce7','#ff5d9b')
        L+=['<g transform="translate(560 710)" filter="url(#shadow)"><path d="M0 55 Q40 -10 105 -22 H230 Q290 -8 330 55 H245 L210 27 H120 L85 55Z" fill="#e23e56"/><circle cx="75" cy="55" r="26" fill="#17191d"/><circle cx="255" cy="55" r="26" fill="#17191d"/><rect x="125" y="-5" width="72" height="25" rx="9" fill="#2d8cff"/></g>']
    elif theme=='gaming':
        L+=person(250,560,.98,'#e0ad8e','#5f5be0','#364a72','#403129','#59d7ff',pose=1)+robot(1190,560,.92,'#59d7ff','#ff5d9b')
        L+=['<g transform="translate(600 705)" filter="url(#shadow)"><rect width="260" height="120" rx="26" fill="#292f52" stroke="#6f6aff" stroke-width="8"/><path d="M45 60 H215" stroke="#59d7ff" stroke-width="10"/><circle cx="74" cy="60" r="12" fill="#ffd452"/><circle cx="187" cy="60" r="12" fill="#ff5d9b"/></g>']
    elif theme=='music':
        L+=person(240,560,.96,'#efbf9d','#8d5de4','#384d81','#4a302a','#ffd452',pose=1)+person(1190,560,.93,'#d9997c','#ff5d9b','#3e596a','#322927','#59d7ff',pose=2)
        L+=['<g transform="translate(690 680)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="105" ry="30" fill="#252a3d"/><circle r="44" fill="#e8ebf1"/><circle r="13" fill="#2a2d37"/><path d="M100 0 H150" stroke="#788093" stroke-width="12"/></g>']
    elif theme=='halloween':
        L+=person(250,570,.98,'#d69e7f','#7f4bb1','#302641','#2f252b','#ff8a3d',pose=1)+['<g transform="translate(1180 600)" filter="url(#shadow)"><ellipse cx="0" cy="120" rx="70" ry="15" fill="#000" opacity=".25"/><path d="M0 120 Q-60 100 -50 5 Q-45 -45 0 -65 Q45 -45 50 5 Q60 100 0 120Z" fill="#f0f2ec"/><circle cx="-18" cy="-5" r="9" fill="#222"/><circle cx="18" cy="-5" r="9" fill="#222"/><path d="M-22 30 Q0 48 22 30" stroke="#222" stroke-width="7" fill="none"/></g>']
        L+=['<path d="M108 620 Q140 570 168 620" stroke="#ff8a3d" stroke-width="10" fill="none"/><path d="M127 590 L150 548 L171 590" stroke="#6d5a41" stroke-width="9" fill="none"/>']
    elif theme=='party':
        L+=person(240,560,.98,'#e2ad90','#5d7de1','#3f517f','#3c2d2a','#ffd452',pose=1)+person(1185,560,.93,'#f0c0a2','#f15b94','#5d4c8f','#432e28','#59d7ff',pose=2)
        L+=['<g transform="translate(620 700)" filter="url(#shadow)"><rect width="200" height="105" rx="18" fill="#ff7eaa"/><rect x="20" y="38" width="160" height="55" rx="12" fill="#fff3fa"/><path d="M70 38 V-8 M130 38 V-8" stroke="#ffd452" stroke-width="8"/><circle cx="70" cy="-18" r="10" fill="#ff6f63"/><circle cx="130" cy="-18" r="10" fill="#57c8ef"/></g>']
    elif theme=='rainbow':
        L+=person(250,560,.98,'#f0c3a3','#7a69e3','#4a6d91','#49322e','#ffd452',pose=1)+person(1185,560,.92,'#ddb08f','#ef6aa7','#5e7c52','#3d3029','#fff',pose=2)
        L+=['<g transform="translate(690 690)" filter="url(#shadow)"><path d="M0 120 Q50 35 100 120Z" fill="#c08e5d"/><path d="M35 84 Q50 54 65 84" stroke="#fff" stroke-width="9" fill="none"/><path d="M20 50 Q50 15 80 50" stroke="#ff6a84" stroke-width="9" fill="none"/></g>']
    elif theme=='arcade':
        L+=person(250,560,.98,'#f1c2a2','#3aaadf','#48517c','#3d2d29','#ffd452',pose=1)+robot(1190,560,.92,'#ff5d9b','#59d7ff')
        L+=['<g transform="translate(640 690)" filter="url(#shadow)"><path d="M0 110 V5 Q0 -10 18 -10 H140 Q158 -10 158 5 V110Z" fill="#242a4a" stroke="#ffd452" stroke-width="8"/><rect x="20" y="18" width="118" height="60" rx="10" fill="#101526"/><circle cx="52" cy="92" r="12" fill="#ff557f"/><circle cx="95" cy="92" r="12" fill="#58cf7e"/></g>']
    elif theme=='volcano':
        L+=person(250,560,.98,'#d89e7b','#e86f35','#394869','#3c2d29','#ffd452',pose=1)+person(1180,560,.94,'#efbe9f','#5f617f','#493f55','#3c302b','#ff8b32',pose=2)
        L+=['<g transform="translate(620 715)" filter="url(#shadow)"><path d="M0 110 Q55 20 110 110Z" fill="#4d3b41"/><path d="M55 40 Q40 64 56 82" stroke="#ff6b21" stroke-width="16" fill="none"/></g>']
    elif theme=='study':
        L+=person(250,565,.96,'#f0c09f','#6d7fdc','#6d4d36','#4d3027','#ffd452',pose=1)+person(1185,560,.92,'#dca27f','#75b982','#5a4d39','#3d3029','#fff',pose=2)
        L+=['<g transform="translate(710 690) rotate(-4)" filter="url(#shadow)"><rect width="270" height="165" rx="12" fill="#fffef8"/><path d="M25 42 H245 M25 78 H220 M25 114 H205" stroke="#aaa49d" stroke-width="8"/><path d="M25 142 H150" stroke="#efc04f" stroke-width="8"/></g>']
    return L

for name in ['winter','christmas','classroom','ocean','space','jungle','candy','neon','spring','summer','autumn','sports','football','basketball','racing','gaming','music','halloween','party','rainbow','arcade','volcano','study']:
    append(name, theme_pack(name))
print('added characters to',23,'themes')
