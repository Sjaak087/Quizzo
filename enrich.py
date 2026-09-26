from pathlib import Path
import random, math
ROOT=Path('/mnt/data/quizzo_v17_work/themes')
random.seed(123)

def append_lines(name, lines):
    p=ROOT/f'{name}.svg'
    s=p.read_text(encoding='utf-8')
    s=s.replace('</svg>','\n'+'\n'.join(lines)+'\n</svg>')
    p.write_text(s,encoding='utf-8')

def generic_sparkles():
    L=['<!-- detailed foreground particles and depth accents -->']
    for i in range(46):
        x=random.randint(25,1415);y=random.randint(40,820);r=random.choice([2,3,4,5,7]);
        c=random.choice(['#ffffff','#ffd452','#6fe0ff','#ff7ba7'])
        L += [f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="{random.choice([0.25,0.35,0.5,0.7])}"/>']
    for i in range(18):
        x=random.randint(30,1410);y=random.randint(80,760);s=random.randint(8,16)
        L += [f'<path d="M{x} {y-s*2} L{x+s//2} {y-s//2} L{x+s*2} {y} L{x+s//2} {y+s//2} L{x} {y+s*2} L{x-s//2} {y+s//2} L{x-s*2} {y} L{x-s//2} {y-s//2}Z" fill="#fff" opacity=".22"/>']
    return L

def pack_winter():
    L=generic_sparkles();L += ['<!-- WINTER detailed props -->']
    # frosted cabins with chimneys
    for x in [25,1320]:
        L += [f'''<g transform="translate({x} 585)" filter="url(#shadow)">
 <path d="M0 40 L125 -55 L250 40 V180 H0Z" fill="#8a4e40"/>
 <path d="M-18 42 L125 -70 L268 42" stroke="#fff" stroke-width="22" fill="none"/>
 <rect x="18" y="78" width="52" height="64" fill="#ffd76b"/><rect x="180" y="78" width="52" height="64" fill="#ffd76b"/>
 <path d="M84 180 V95 Q125 72 166 95 V180" fill="#5d3e31"/>
 <rect x="198" y="-96" width="25" height="90" rx="5" fill="#614235"/>
 <path d="M195 -99 Q210 -120 232 -98" stroke="#eef8ff" stroke-width="16" fill="none"/>
 </g>''']
    # ski gate + skis
    L += ['<g transform="translate(410 660)" filter="url(#shadow)"><path d="M0 150 L0 0 M92 150 L92 0" stroke="#d9435b" stroke-width="13"/><path d="M0 24 Q46 55 92 24" stroke="#fff" stroke-width="18" fill="none"/><path d="M-28 155 Q46 170 120 155" stroke="#7a93ae" stroke-width="10" fill="none"/></g>',
          '<g transform="translate(1120 770) rotate(-9)" filter="url(#shadow)"><path d="M0 0 Q110 -30 220 0" stroke="#f2f6fb" stroke-width="15" fill="none"/><path d="M0 22 Q110 -8 220 22" stroke="#5b7fa2" stroke-width="11" fill="none"/></g>']
    return L

def simple_pack(theme, specs, extras):
    L=generic_sparkles()+[f'<!-- {theme.upper()} detailed 3D object layer -->']
    for sp in specs:
        L.append(sp)
    L += extras
    return L

packs={}
packs['winter']=pack_winter()
packs['christmas']=simple_pack('christmas',[
'''<g transform="translate(35 410)" filter="url(#shadow)"><path d="M0 170 H250 V-5 H0Z" fill="#763b31"/><path d="M-22 8 L125 -72 L272 8" fill="#9e493f"/><path d="M-18 2 L125 -70 L268 2" stroke="#fff" stroke-width="20" fill="none"/><rect x="82" y="72" width="60" height="98" fill="#4f3029"/><rect x="18" y="52" width="42" height="48" fill="#ffd45f"/><rect x="190" y="52" width="42" height="48" fill="#ffd45f"/></g>''',
'''<g transform="translate(1120 470)" filter="url(#shadow)"><rect x="0" y="0" width="260" height="260" rx="18" fill="#7c4135"/><path d="M30 80 Q130 10 230 80" fill="#d26b50"/><path d="M70 90 V210 M130 70 V210 M190 90 V210" stroke="#ffda67" stroke-width="20"/><rect x="90" y="20" width="80" height="35" fill="#4b2f29"/></g>'''],[
'<path d="M0 285 Q180 230 340 290" stroke="#f0c84b" stroke-width="14" fill="none"/>',
'<path d="M0 300 Q180 245 340 305" stroke="#cf3c48" stroke-width="7" fill="none"/>',
'<g transform="translate(660 610)" filter="url(#shadow)"><circle r="60" fill="#fff" stroke="#d4dbe7" stroke-width="7"/><circle cx="-18" cy="-12" r="6" fill="#222"/><circle cx="18" cy="-12" r="6" fill="#222"/><path d="M-22 18 Q0 34 22 18" stroke="#222" stroke-width="5" fill="none"/></g>',
'<g transform="translate(120 780)" filter="url(#shadow)"><rect width="180" height="70" rx="15" fill="#e54358"/><rect x="78" width="22" height="70" fill="#ffd452"/><path d="M90 0 Q60 -35 35 0 M90 0 Q120 -35 145 0" stroke="#ffd452" stroke-width="12" fill="none"/></g>'])
packs['classroom']=simple_pack('classroom',[
'''<g transform="translate(1180 390)" filter="url(#shadow)"><circle r="58" fill="#f4dfb1"/><circle cx="0" cy="0" r="48" fill="#f7f0df"/><path d="M0 -38 V38 M-38 0 H38" stroke="#8b5c40" stroke-width="5"/><path d="M0 -58 V-45" stroke="#7d5337" stroke-width="7"/><path d="M48 0 H35" stroke="#7d5337" stroke-width="7"/></g>''',
'''<g transform="translate(1120 640)" filter="url(#shadow)"><rect width="220" height="115" rx="14" fill="#f2ece0"/><path d="M22 30 H190 M22 58 H172 M22 86 H150" stroke="#5c765f" stroke-width="7"/><rect x="82" y="-25" width="55" height="25" rx="5" fill="#efbb58"/></g>'''],[
'<g transform="translate(65 650)" filter="url(#shadow)"><rect width="150" height="170" rx="14" fill="#4a5b48"/><rect x="18" y="18" width="114" height="22" fill="#f4eee4"/><rect x="18" y="54" width="92" height="18" fill="#efbb58"/><rect x="18" y="86" width="104" height="18" fill="#e86866"/><rect x="18" y="118" width="78" height="18" fill="#5da8e4"/></g>',
'<g transform="translate(1000 730) rotate(-12)" filter="url(#shadow)"><rect width="175" height="28" rx="12" fill="#efc04d"/><path d="M175 0 L205 14 L175 28Z" fill="#d58d4c"/><path d="M38 0 V28" stroke="#fff" stroke-width="7"/></g>'])
packs['ocean']=simple_pack('ocean',[
'''<g transform="translate(70 670)" filter="url(#shadow)"><path d="M0 165 Q40 60 100 0 Q160 60 198 165Z" fill="#e75c76"/><path d="M32 130 Q54 80 66 22 M96 150 Q110 80 125 18 M155 140 Q170 92 176 36" stroke="#ffe0df" stroke-width="8" fill="none"/></g>''',
'''<g transform="translate(1240 660)" filter="url(#shadow)"><path d="M0 180 Q40 72 95 10 Q165 60 220 180Z" fill="#62be9a"/><path d="M45 130 Q82 77 98 30 M130 145 Q150 91 166 38" stroke="#e9fff2" stroke-width="8" fill="none"/></g>'''],[
'<g transform="translate(420 640)" filter="url(#shadow)"><path d="M0 110 Q50 40 130 42 Q160 55 175 110Z" fill="#8d5c39"/><path d="M25 76 Q90 35 145 76" stroke="#d89a4e" stroke-width="14" fill="none"/><path d="M78 45 V110" stroke="#f3c75b" stroke-width="9"/></g>',
'<g transform="translate(980 680)" filter="url(#shadow)"><path d="M0 130 Q58 -5 116 130 Q58 95 0 130Z" fill="#f8e7b4"/><path d="M58 0 V135" stroke="#7da7bd" stroke-width="7"/></g>'])
packs['space']=simple_pack('space',[
'''<g transform="translate(80 180) rotate(-12)" filter="url(#shadow)"><rect x="0" y="0" width="190" height="22" rx="8" fill="#cbd9ee"/><rect x="70" y="-65" width="50" height="150" rx="14" fill="#a9bdd7"/><rect x="-58" y="-10" width="58" height="42" fill="#537db2"/><rect x="190" y="-10" width="58" height="42" fill="#537db2"/><circle cx="96" cy="11" r="22" fill="#5ec9ef"/></g>''',
'''<g transform="translate(1230 580)" filter="url(#shadow)"><circle r="72" fill="#e6a24a"/><path d="M-52 -12 Q0 -46 54 -5 M-40 28 Q0 10 42 32" stroke="#7a5542" stroke-width="13" fill="none"/><path d="M0 72 V95" stroke="#6d4f43" stroke-width="8"/></g>'''],[
'<ellipse cx="760" cy="230" rx="120" ry="24" fill="none" stroke="#75d6ff" stroke-width="8" opacity=".4"/>',
'<g transform="translate(1060 120)" filter="url(#shadow)"><path d="M0 0 Q60 -60 120 0 Q60 65 0 0Z" fill="#dfe9f8"/><circle cx="60" cy="0" r="22" fill="#61c9e9"/><path d="M20 28 H100" stroke="#9ab5d0" stroke-width="7"/></g>'])
packs['jungle']=simple_pack('jungle',[
'''<g transform="translate(20 500)" filter="url(#shadow)"><path d="M0 220 Q80 80 155 0 Q235 80 300 220Z" fill="#1f7b4e"/><path d="M70 190 Q95 90 135 20 M160 205 Q182 110 220 34" stroke="#63c873" stroke-width="15" fill="none"/></g>''',
'''<g transform="translate(1180 510)" filter="url(#shadow)"><path d="M0 200 Q55 75 130 0 Q205 75 280 200Z" fill="#2b8a55"/><path d="M55 166 Q92 82 118 20 M152 183 Q175 108 216 48" stroke="#77d981" stroke-width="14" fill="none"/></g>'''],[
'<g transform="translate(1070 420)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="58" ry="72" fill="#e75961"/><circle cx="0" cy="-63" r="36" fill="#4c7ef1"/><path d="M-22 -58 L-70 -30 L-28 -18Z" fill="#ffd452"/><circle cx="9" cy="-65" r="6" fill="#fff"/><circle cx="9" cy="-65" r="3" fill="#222"/></g>',
'<g transform="translate(300 680)" filter="url(#shadow)"><path d="M0 130 L0 30 Q60 -20 120 30 V130Z" fill="#926646"/><path d="M20 55 Q60 25 100 55" stroke="#4f9b56" stroke-width="20" fill="none"/><path d="M52 12 Q60 -60 74 12" stroke="#4f9b56" stroke-width="18" fill="none"/></g>'])
packs['candy']=simple_pack('candy',[
'''<g transform="translate(70 420) rotate(-12)" filter="url(#shadow)"><rect x="-6" y="40" width="12" height="210" fill="#fff"/><circle cy="0" r="76" fill="#ff668f"/><path d="M-58 -28 Q0 -80 58 -28 Q0 20 -58 -28Z" fill="#fff" opacity=".9"/></g>''',
'''<g transform="translate(1190 360) rotate(10)" filter="url(#shadow)"><rect x="-6" y="40" width="12" height="230" fill="#fff"/><circle cy="0" r="84" fill="#6bc9ef"/><path d="M-64 -28 Q0 -86 64 -28 Q0 20 -64 -28Z" fill="#fff" opacity=".9"/></g>'''],[
'<g transform="translate(420 690)" filter="url(#shadow)"><path d="M0 0 H220 Q205 90 110 110 Q15 90 0 0Z" fill="#f5a657"/><path d="M15 18 H205" stroke="#fff" stroke-width="14"/><path d="M60 40 H160" stroke="#e65e92" stroke-width="12"/></g>',
'<g transform="translate(1010 700)" filter="url(#shadow)"><circle cx="0" cy="0" r="70" fill="#f0d27c"/><circle cx="-22" cy="-18" r="14" fill="#e97576"/><circle cx="25" cy="14" r="13" fill="#5fc1e7"/><circle cx="18" cy="-32" r="10" fill="#8d66dd"/></g>'])
packs['neon']=simple_pack('neon',[
'''<g transform="translate(40 390)" filter="url(#shadow)"><rect width="300" height="145" rx="24" fill="#0e1226" stroke="#35e7ff" stroke-width="9"/><text x="150" y="88" text-anchor="middle" font-size="52" font-family="Arial" font-weight="900" fill="#35e7ff">PLAY</text><path d="M20 22 H280" stroke="#ff4f9a" stroke-width="5"/></g>''',
'''<g transform="translate(1080 360)" filter="url(#shadow)"><rect width="300" height="155" rx="24" fill="#0e1226" stroke="#ff4f9a" stroke-width="9"/><text x="150" y="96" text-anchor="middle" font-size="45" font-family="Arial" font-weight="900" fill="#ff4f9a">QUIZ</text><circle cx="35" cy="35" r="9" fill="#ffd452"/></g>'''],[
'<path d="M0 660 Q240 600 450 650" stroke="#35e7ff" stroke-width="7" fill="none" opacity=".5"/>',
'<path d="M990 720 Q1200 650 1440 700" stroke="#ff4f9a" stroke-width="7" fill="none" opacity=".5"/>',
'<g transform="translate(560 760)" filter="url(#shadow)"><path d="M0 60 Q40 -15 100 -22 H230 Q280 -8 320 60 Z" fill="#242844" stroke="#35e7ff" stroke-width="7"/><circle cx="70" cy="60" r="27" fill="#111" stroke="#ff4f9a" stroke-width="8"/><circle cx="250" cy="60" r="27" fill="#111" stroke="#35e7ff" stroke-width="8"/></g>'])
packs['spring']=simple_pack('spring',[
'''<g transform="translate(45 420)" filter="url(#shadow)"><path d="M0 230 Q10 95 35 0" stroke="#7b4f2e" stroke-width="28" fill="none"/><circle cx="-20" cy="10" r="65" fill="#ff91b9"/><circle cx="75" cy="-5" r="70" fill="#ffb1cc"/><circle cx="130" cy="42" r="50" fill="#ff91b9"/></g>''',
'''<g transform="translate(1250 450)" filter="url(#shadow)"><path d="M0 220 Q5 100 25 0" stroke="#7b4f2e" stroke-width="28" fill="none"/><circle cx="-35" cy="28" r="62" fill="#ff91b9"/><circle cx="58" cy="-2" r="72" fill="#ffb1cc"/><circle cx="120" cy="45" r="52" fill="#ff91b9"/></g>'''],[
'<g transform="translate(660 260)" filter="url(#shadow)"><path d="M0 60 Q0 0 60 0 Q120 0 120 60 Q60 40 0 60Z" fill="#e8f1d1"/><rect x="56" y="52" width="8" height="90" fill="#7b5b40"/></g>',
'<g transform="translate(1120 740)"><ellipse rx="24" ry="15" fill="#ffd452"/><ellipse cx="18" cy="0" rx="24" ry="15" fill="#ff72aa"/></g>'])
packs['summer']=simple_pack('summer',[
'''<g transform="translate(28 540)" filter="url(#shadow)"><path d="M0 260 Q30 120 42 0" stroke="#8e6042" stroke-width="26" fill="none"/><path d="M40 25 Q-30 -15 -92 8 Q-43 48 40 52" fill="#35a85d"/><path d="M46 25 Q120 -20 188 4 Q132 50 48 52" fill="#2f9652"/><path d="M42 30 Q28 -48 56 -92 Q80 -28 50 34" fill="#4dbc67"/></g>''',
'''<g transform="translate(1300 510)" filter="url(#shadow)"><path d="M0 250 Q20 110 30 0" stroke="#8e6042" stroke-width="26" fill="none"/><path d="M28 25 Q-40 -10 -105 10 Q-45 48 30 52" fill="#35a85d"/><path d="M35 25 Q110 -15 180 5 Q118 50 38 52" fill="#2f9652"/><path d="M30 30 Q18 -48 48 -92 Q75 -25 38 35" fill="#4dbc67"/></g>'''],[
'<g transform="translate(260 745)" filter="url(#shadow)"><path d="M0 80 L90 -5 L180 80Z" fill="#eecf7f"/><path d="M18 74 L90 12 L162 74" stroke="#f4f7e9" stroke-width="18"/><rect x="76" y="45" width="28" height="55" fill="#d96b52"/></g>',
'<g transform="translate(1050 660) rotate(8)" filter="url(#shadow)"><path d="M0 140 Q60 20 120 140 Q60 108 0 140Z" fill="#ff6d9e"/><path d="M60 0 V150" stroke="#fff" stroke-width="10"/><path d="M20 65 Q60 45 100 65" stroke="#ffd452" stroke-width="10"/></g>'])
packs['autumn']=simple_pack('autumn',[
'''<g transform="translate(40 420)" filter="url(#shadow)"><path d="M0 260 Q0 120 20 0" stroke="#674027" stroke-width="34" fill="none"/><circle cx="-20" cy="35" r="74" fill="#e76f2d"/><circle cx="70" cy="0" r="88" fill="#d64a37"/><circle cx="122" cy="65" r="60" fill="#f0a02d"/></g>''',
'''<g transform="translate(1270 420)" filter="url(#shadow)"><path d="M0 260 Q0 120 20 0" stroke="#674027" stroke-width="34" fill="none"/><circle cx="-20" cy="35" r="74" fill="#e76f2d"/><circle cx="70" cy="0" r="88" fill="#d64a37"/><circle cx="122" cy="65" r="60" fill="#f0a02d"/></g>'''],[
'<g transform="translate(210 760)" filter="url(#shadow)"><rect x="0" y="0" width="190" height="20" rx="10" fill="#7b4a32"/><path d="M25 20 V105 M165 20 V105" stroke="#5d3e2c" stroke-width="12"/><path d="M0 0 Q95 40 190 0" stroke="#ad6a43" stroke-width="12" fill="none"/></g>',
'<g transform="translate(1040 755)" filter="url(#shadow)"><circle r="45" fill="#e17831"/><path d="M-16 -22 Q0 -45 18 -22" stroke="#4d7a40" stroke-width="10" fill="none"/></g>'])
# sports family common packs
packs['sports']=simple_pack('sports', [
'''<g transform="translate(30 360)" filter="url(#shadow)"><rect width="270" height="155" rx="20" fill="#233548"/><rect x="18" y="18" width="234" height="90" fill="#122333"/><text x="135" y="75" text-anchor="middle" font-size="42" font-family="Arial" font-weight="900" fill="#fff">1  2  3</text><path d="M52 120 H218" stroke="#ffd452" stroke-width="10"/></g>''',
'''<g transform="translate(1130 360)" filter="url(#shadow)"><rect width="270" height="155" rx="20" fill="#233548"/><rect x="18" y="18" width="234" height="90" fill="#122333"/><text x="135" y="75" text-anchor="middle" font-size="42" font-family="Arial" font-weight="900" fill="#fff">GO!</text><path d="M52 120 H218" stroke="#55cf7e" stroke-width="10"/></g>'''], [
'<g transform="translate(580 790)" filter="url(#shadow)"><circle r="36" fill="#f2d05e"/><path d="M-20 -5 L0 -20 L20 -5 L20 15 H-20Z" fill="#fff"/><rect x="-3" y="24" width="6" height="18" fill="#8c5d38"/></g>',
'<g transform="translate(1010 735)" filter="url(#shadow)"><rect width="90" height="32" rx="12" fill="#f3f5f8"/><circle cx="18" cy="16" r="9" fill="#f15e62"/><circle cx="72" cy="16" r="9" fill="#2d8cff"/></g>'])
packs['football']=simple_pack('football', [
'''<g transform="translate(40 560)" filter="url(#shadow)"><path d="M0 150 V0 H270 V150" fill="none" stroke="#fff" stroke-width="15"/><path d="M25 0 V150 M75 0 V150 M125 0 V150 M175 0 V150 M225 0 V150" stroke="#d9edf0" stroke-width="5"/></g>'''], [
'<g transform="translate(1240 720)" filter="url(#shadow)"><circle r="55" fill="#fff"/><path d="M-35 -5 L-8 -32 L22 -20 L30 12 L4 32 L-26 20Z" fill="#111"/><path d="M-6 -32 L0 -58 M30 12 L58 30 M-26 20 L-50 42" stroke="#111" stroke-width="7"/></g>',
'<path d="M120 420 H350" stroke="#e94654" stroke-width="10"/><path d="M1090 420 H1320" stroke="#2d8cff" stroke-width="10"/>'])
packs['basketball']=simple_pack('basketball', [
'''<g transform="translate(32 430)" filter="url(#shadow)"><rect x="0" y="0" width="235" height="190" rx="15" fill="#d8e6f1"/><rect x="24" y="24" width="187" height="118" fill="#8ac5e7"/><path d="M117 0 V190 M0 82 H235" stroke="#fff" stroke-width="10"/></g>'''],[
'<g transform="translate(1200 640)" filter="url(#shadow)"><circle r="58" fill="#f08b31"/><path d="M-56 0 H56 M0 -58 V58" stroke="#6e3b22" stroke-width="7"/><path d="M-50 -32 Q0 -55 50 -32 M-50 32 Q0 55 50 32" stroke="#6e3b22" stroke-width="7" fill="none"/></g>',
'<g transform="translate(420 780)" filter="url(#shadow)"><path d="M0 90 V0 H120 L145 22 H-15Z" fill="#f4f5f6"/><path d="M24 70 H96" stroke="#ee7f34" stroke-width="12"/></g>'])
packs['racing']=simple_pack('racing', [
'''<g transform="translate(40 310)" filter="url(#shadow)"><path d="M0 0 H270 V145 H0Z" fill="#d53b4e"/><path d="M0 0 H270 M0 72 H270 M0 145 H270" stroke="#fff" stroke-width="7"/><path d="M54 0 V145 M108 0 V145 M162 0 V145 M216 0 V145" stroke="#222" stroke-width="7" opacity=".65"/></g>'''],[
'<g transform="translate(1110 690)" filter="url(#shadow)"><circle cx="0" cy="0" r="60" fill="#222"/><circle cx="0" cy="0" r="31" fill="#68717c"/><circle cx="0" cy="0" r="10" fill="#d5d8dc"/></g>',
'<g transform="translate(410 610)" filter="url(#shadow)"><rect width="210" height="90" rx="14" fill="#e9edf0"/><rect y="0" width="210" height="15" fill="#f1c446"/><text x="105" y="58" text-anchor="middle" font-size="34" font-family="Arial" font-weight="900" fill="#333">PIT</text></g>'])
packs['gaming']=simple_pack('gaming', [
'''<g transform="translate(35 520)" filter="url(#shadow)"><path d="M0 75 Q15 0 70 0 H190 Q245 0 260 75 L220 118 H174 L150 82 H110 L86 118 H40Z" fill="#252b54" stroke="#59d7ff" stroke-width="8"/><circle cx="76" cy="55" r="11" fill="#ffd452"/><circle cx="185" cy="45" r="10" fill="#ff5d9b"/></g>''',
'''<g transform="translate(1160 510)" filter="url(#shadow)"><path d="M0 75 Q15 0 70 0 H190 Q245 0 260 75 L220 118 H174 L150 82 H110 L86 118 H40Z" fill="#252b54" stroke="#ff5d9b" stroke-width="8"/><circle cx="76" cy="55" r="11" fill="#59d7ff"/><circle cx="185" cy="45" r="10" fill="#ffd452"/></g>'''],[
'<g transform="translate(560 760)" filter="url(#shadow)"><path d="M0 110 V10 Q0 -10 20 -10 H180 Q200 -10 200 10 V110 H0Z" fill="#31384b"/><rect x="20" y="10" width="160" height="80" fill="#1b2236" stroke="#6f6aff" stroke-width="5"/><path d="M35 55 H165" stroke="#59d7ff" stroke-width="8"/></g>'])
packs['music']=simple_pack('music', [
'''<g transform="translate(35 470)" filter="url(#shadow)"><rect width="150" height="255" rx="16" fill="#2b2937"/><circle cx="75" cy="75" r="38" fill="#111" stroke="#59d7ff" stroke-width="7"/><circle cx="75" cy="170" r="50" fill="#111" stroke="#ff5d9b" stroke-width="7"/></g>''',
'''<g transform="translate(1250 470)" filter="url(#shadow)"><rect width="150" height="255" rx="16" fill="#2b2937"/><circle cx="75" cy="75" r="38" fill="#111" stroke="#ff5d9b" stroke-width="7"/><circle cx="75" cy="170" r="50" fill="#111" stroke="#ffd452" stroke-width="7"/></g>'''],[
'<g transform="translate(450 710)" filter="url(#shadow)"><ellipse cx="0" cy="0" rx="110" ry="32" fill="#252a3d"/><circle cx="0" cy="0" r="42" fill="#e5e7eb"/><circle cx="0" cy="0" r="13" fill="#2b2d38"/><path d="M110 0 H155" stroke="#7e8394" stroke-width="12"/></g>',
'<g transform="translate(990 720)" filter="url(#shadow)"><path d="M0 100 Q0 0 52 -35 Q105 0 105 100" fill="#9c6444"/><rect x="45" y="0" width="12" height="150" fill="#d2a06b"/><path d="M0 15 H105 M8 42 H97 M15 69 H90" stroke="#6e3d2c" stroke-width="8"/></g>'])
packs['halloween']=simple_pack('halloween', [
'''<g transform="translate(35 470)" filter="url(#shadow)"><path d="M0 210 L120 -40 L240 210Z" fill="#221426"/><path d="M40 155 H200 V210 H40Z" fill="#1a0d1c"/><circle cx="120" cy="65" r="13" fill="#ff8a3c"/><path d="M95 105 Q120 78 145 105" stroke="#ff8a3c" stroke-width="8" fill="none"/></g>'''],[
'<g transform="translate(1210 680)" filter="url(#shadow)"><path d="M0 160 Q80 80 160 160" stroke="#7b5d43" stroke-width="10" fill="none"/><circle cx="80" cy="85" r="45" fill="#26202c"/><circle cx="65" cy="80" r="6" fill="#ff9c3d"/><circle cx="95" cy="80" r="6" fill="#ff9c3d"/></g>',
'<g transform="translate(520 780)" filter="url(#shadow)"><path d="M0 50 Q45 20 90 50" stroke="#d9dbe0" stroke-width="14" fill="none"/><path d="M18 20 Q18 -4 38 -4 Q58 -4 58 20" stroke="#d9dbe0" stroke-width="10" fill="none"/></g>'])
packs['party']=simple_pack('party', [
'''<g transform="translate(0 520)" filter="url(#shadow)"><path d="M0 0 H80 L140 160 H-60Z" fill="#ff4f9a" opacity=".5"/></g>''',
'''<g transform="translate(1360 520)" filter="url(#shadow)"><path d="M0 0 H80 L140 160 H-60Z" fill="#49d7ff" opacity=".5"/></g>'''],[
'<g transform="translate(350 720)" filter="url(#shadow)"><rect width="120" height="90" rx="18" fill="#ff7ca9"/><path d="M60 0 V-45" stroke="#fff" stroke-width="7"/><circle cx="60" cy="-60" r="12" fill="#ffd452"/></g>',
'<g transform="translate(1040 720)" filter="url(#shadow)"><rect width="120" height="90" rx="18" fill="#5fcaff"/><path d="M60 0 V-45" stroke="#fff" stroke-width="7"/><circle cx="60" cy="-60" r="12" fill="#ff7ca9"/></g>'])
packs['rainbow']=simple_pack('rainbow', [
'''<g transform="translate(55 530)" filter="url(#shadow)"><path d="M0 150 L125 20 L250 150Z" fill="#6fb45f"/><path d="M50 105 Q125 55 200 105" stroke="#8a6ee8" stroke-width="22" fill="none"/><path d="M36 120 Q125 45 214 120" stroke="#f5c14d" stroke-width="18" fill="none"/><path d="M20 140 Q125 35 230 140" stroke="#ed5b72" stroke-width="18" fill="none"/></g>'''],[
'<g transform="translate(1160 510)" filter="url(#shadow)"><rect width="220" height="150" rx="12" fill="#f0e7d5"/><rect x="20" y="35" width="50" height="115" fill="#e2d0b5"/><rect x="150" y="35" width="50" height="115" fill="#e2d0b5"/><path d="M-25 35 L110 -65 L245 35" fill="#db6680"/></g>',
'<g transform="translate(720 620)" filter="url(#shadow)"><circle cx="0" cy="0" r="18" fill="#fff2a4"/><path d="M0 -48 V-15 M0 15 V48 M-48 0 H-15 M15 0 H48" stroke="#fff2a4" stroke-width="6"/></g>'])
packs['arcade']=simple_pack('arcade', [
'''<g transform="translate(20 360)" filter="url(#shadow)"><path d="M0 220 V20 Q0 0 20 0 H135 Q155 0 155 20 V220Z" fill="#242a4a" stroke="#43d4ff" stroke-width="8"/><rect x="22" y="34" width="111" height="86" rx="10" fill="#101526"/><circle cx="62" cy="165" r="13" fill="#ff557f"/><circle cx="102" cy="165" r="13" fill="#58cf7e"/></g>''',
'''<g transform="translate(1265 360)" filter="url(#shadow)"><path d="M0 220 V20 Q0 0 20 0 H135 Q155 0 155 20 V220Z" fill="#242a4a" stroke="#ff557f" stroke-width="8"/><rect x="22" y="34" width="111" height="86" rx="10" fill="#101526"/><circle cx="62" cy="165" r="13" fill="#ffd452"/><circle cx="102" cy="165" r="13" fill="#43d4ff"/></g>'''],[
'<g transform="translate(520 700)" filter="url(#shadow)"><path d="M0 70 Q25 0 100 0 Q175 0 200 70Z" fill="#b84965"/><circle cx="65" cy="35" r="10" fill="#fff"/><circle cx="135" cy="35" r="10" fill="#fff"/><path d="M100 70 V130" stroke="#ffd452" stroke-width="10"/></g>',
'<g transform="translate(900 735)" filter="url(#shadow)"><circle r="44" fill="#ffd452"/><circle r="25" fill="#2f2f39"/><path d="M-16 0 H16" stroke="#fff" stroke-width="5"/></g>'])
packs['volcano']=simple_pack('volcano', [
'''<g transform="translate(20 540)" filter="url(#shadow)"><path d="M0 200 L80 30 L160 200Z" fill="#493135"/><path d="M78 44 Q50 90 82 135" stroke="#ff6b21" stroke-width="20" fill="none"/><circle cx="100" cy="75" r="10" fill="#ffd452"/></g>''',
'''<g transform="translate(1210 540)" filter="url(#shadow)"><path d="M0 200 L80 30 L160 200Z" fill="#493135"/><path d="M78 44 Q50 90 82 135" stroke="#ff6b21" stroke-width="20" fill="none"/><circle cx="100" cy="75" r="10" fill="#ffd452"/></g>'''],[
'<g transform="translate(350 750)" filter="url(#shadow)"><path d="M0 60 L30 0 L85 12 L110 62 L72 92 L20 88Z" fill="#5c4a50"/></g>',
'<g transform="translate(1030 760)" filter="url(#shadow)"><path d="M0 60 L30 0 L85 12 L110 62 L72 92 L20 88Z" fill="#5c4a50"/></g>',
'<circle cx="690" cy="190" r="18" fill="#ffd452" opacity=".55"/><circle cx="760" cy="140" r="10" fill="#ff8b32" opacity=".65"/>'])
packs['study']=simple_pack('study', [
'''<g transform="translate(45 430)" filter="url(#shadow)"><rect width="245" height="300" rx="10" fill="#7b553e"/><rect x="18" y="18" width="209" height="74" fill="#4e3e32"/><rect x="18" y="110" width="209" height="74" fill="#4e3e32"/><rect x="18" y="202" width="209" height="74" fill="#4e3e32"/><rect x="40" y="28" width="20" height="54" fill="#ef6c6c"/><rect x="75" y="28" width="20" height="54" fill="#5d8df5"/><rect x="110" y="28" width="20" height="54" fill="#ffd452"/></g>'''],[
'<g transform="translate(1190 580)" filter="url(#shadow)"><path d="M0 80 Q60 35 120 80" stroke="#5d4d46" stroke-width="12" fill="none"/><path d="M15 75 V160 M105 75 V160" stroke="#5d4d46" stroke-width="12"/></g>',
'<g transform="translate(790 740) rotate(-8)" filter="url(#shadow)"><rect width="280" height="150" rx="12" fill="#fffef8"/><path d="M30 40 H245 M30 78 H220 M30 116 H190" stroke="#aaa49d" stroke-width="7"/></g>'])

# write packs, but winter has an accidental unused loop helper above; just use intended pack.
for name,lines in packs.items():
    append_lines(name, lines)
print('enriched',len(packs),'themes')
