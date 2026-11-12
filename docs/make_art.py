from pathlib import Path
p = Path(__file__).resolve().parents[1] / 'public' / 'assets'
p.mkdir(parents=True, exist_ok=True)

def wrap(body, h=1480, extra=''):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 {h}" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="night" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#233b48"/><stop offset=".5" stop-color="#102936"/><stop offset="1" stop-color="#081925"/></linearGradient>
 <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#43606a"/><stop offset="1" stop-color="#0d242e"/></linearGradient>
 <linearGradient id="bronze" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e1c9a0"/><stop offset="1" stop-color="#a48354"/></linearGradient>
 <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#465669"/><stop offset=".6" stop-color="#263a48"/><stop offset="1" stop-color="#10212a"/></linearGradient>
 <pattern id="grain" width="72" height="72" patternUnits="userSpaceOnUse"><circle cx="7" cy="19" r="1" fill="#f0d7ac" opacity=".22"/><circle cx="32" cy="44" r="1.3" fill="#f0d7ac" opacity=".15"/><circle cx="56" cy="11" r=".8" fill="#f0d7ac" opacity=".32"/><circle cx="67" cy="60" r=".65" fill="#f0d7ac" opacity=".2"/></pattern>
 <filter id="blur"><feGaussianBlur stdDeviation="12"/></filter></defs>
 {body}
 <rect width="1080" height="{h}" fill="url(#grain)" opacity=".6"/>{extra}
 </svg>'''

def write(name, body, h=1480):
 (p/name).write_text(wrap(body,h), encoding='utf-8')

# Обложка — метафорический коллаж железной дороги и моря, не документальная фотография.
write('cover.svg', '''
<rect width="1080" height="1480" fill="url(#night)"/>
<circle cx="785" cy="288" r="175" fill="#dfc9a0" opacity=".055"/>
<circle cx="785" cy="288" r="105" fill="#e3cbaa" opacity=".85"/>
<path d="M0 715 Q154 602 252 643 T502 629 T805 650 T1080 588 L1080 1480 H0Z" fill="#2d4954"/>
<path d="M0 779 Q212 719 427 775 T1080 760 L1080 1480 H0Z" fill="#162f3d"/>
<path d="M0 914 C302 874 561 884 1080 838 L1080 1480 H0Z" fill="url(#sea)"/>
<path d="M0 1043 Q214 1024 380 1057 T758 1063 T1080 1042" fill="none" stroke="#bdab87" stroke-width="3" opacity=".4"/>
<path d="M0 1095 Q255 1076 448 1113 T1080 1104 M0 1216 Q318 1192 580 1227 T1080 1214" fill="none" stroke="#8daba9" stroke-width="3" opacity=".19"/>
<path d="M-20 875 Q311 773 628 860 T1120 853" fill="none" stroke="#ae895a" stroke-width="19" opacity=".95"/>
<path d="M-20 894 Q311 790 628 877 T1120 870" fill="none" stroke="#090f14" stroke-width="10"/>
<g transform="translate(115 688) rotate(-5)">
<rect x="0" y="48" width="650" height="154" rx="19" fill="#12252b" stroke="#bda57e" stroke-width="5"/>
<path d="M628 66 L705 88 705 189 628 203Z" fill="#142935" stroke="#bda57e" stroke-width="4"/>
<rect x="28" y="79" width="114" height="60" rx="9" fill="#baaf93" opacity=".9"/>
<rect x="164" y="79" width="110" height="60" rx="9" fill="#baaf93" opacity=".9"/>
<rect x="295" y="79" width="114" height="60" rx="9" fill="#baaf93" opacity=".9"/>
<rect x="432" y="79" width="107" height="60" rx="9" fill="#baaf93" opacity=".9"/>
<rect x="560" y="77" width="62" height="90" rx="7" fill="#c4aa80" opacity=".8"/>
<path d="M0 162 H701" stroke="#bda57e" stroke-width="6"/>
<circle cx="110" cy="217" r="30" fill="#090f14" stroke="#bda57e" stroke-width="6"/><circle cx="362" cy="217" r="30" fill="#090f14" stroke="#bda57e" stroke-width="6"/><circle cx="593" cy="217" r="30" fill="#090f14" stroke="#bda57e" stroke-width="6"/>
<path d="M28 77 H609" stroke="#ebd9b6" stroke-width="4" opacity=".45"/>
</g>
<path d="M0 1370 Q360 1330 684 1374 T1080 1360" fill="none" stroke="#c5b28d" stroke-width="2" opacity=".35"/>
''')
write('station.svg', '''
<rect width="1080" height="1480" fill="url(#dusk)"/>
<circle cx="796" cy="323" r="92" fill="#d7b88d" opacity=".72"/>
<path d="M0 648 L134 581 300 613 496 516 630 553 813 473 1080 578 V1480 H0Z" fill="#1a2f39"/>
<path d="M0 831 H1080 V1480 H0Z" fill="#0b1e2b"/>
<path d="M0 678 H1080" stroke="#cfb486" stroke-width="8" opacity=".5"/>
<rect x="0" y="647" width="1080" height="32" fill="#1b303b"/>
<rect x="92" y="532" width="45" height="309" fill="#142630"/><rect x="750" y="512" width="42" height="357" fill="#162932"/>
<path d="M65 534 H832" stroke="#b59a77" stroke-width="5" opacity=".6"/>
<path d="M-60 1480 L477 840 M1120 1480 L610 840" stroke="#8e856e" stroke-width="20"/>
<path d="M-80 1450 L1120 1450 M-40 1330 L1080 1330 M45 1200 L1015 1200 M170 1060 L897 1060 M310 936 L750 936" stroke="#9d8d75" stroke-width="8" opacity=".55"/>
<g fill="#080f19" opacity=".85"><circle cx="300" cy="796" r="24"/><path d="M279 816 L324 816 345 994 270 994Z"/><circle cx="389" cy="784" r="21"/><path d="M369 805 H410 L432 993 H350Z"/><circle cx="494" cy="801" r="25"/><path d="M469 822 H520 L536 1010 H450Z"/></g>
''')
write('train.svg', '''
<rect width="1080" height="1480" fill="#151f28"/>
<path d="M105 137 H974 V1052 H105Z" fill="#d8b88d" opacity=".35"/>
<path d="M153 183 H931 V1006 H153Z" fill="url(#dusk)"/>
<circle cx="734" cy="391" r="104" fill="#d4c4a7" opacity=".74"/>
<path d="M153 733 Q350 699 521 738 T931 709 V1006 H153Z" fill="#273e47"/>
<path d="M153 846 Q420 778 931 859 V1006 H153Z" fill="#102b34"/>
<path d="M153 939 Q380 895 931 963" fill="none" stroke="#e0c4a5" stroke-width="4" opacity=".43"/>
<rect x="104" y="135" width="52" height="955" rx="17" fill="#a88d65"/><rect x="928" y="135" width="55" height="955" rx="15" fill="#a88d65"/>
<rect x="103" y="125" width="878" height="61" rx="20" fill="#a88d65"/>
<rect x="94" y="1001" width="890" height="66" rx="9" fill="#a88d65"/>
<path d="M87 1071 L0 1480 H1080 L984 1071Z" fill="#202f36"/>
<path d="M100 1125 Q543 1180 978 1125 M30 1432 Q550 1510 1050 1432" stroke="#c4aa87" stroke-width="5" opacity=".22" fill="none"/>
<rect x="464" y="186" width="29" height="815" fill="#b59b77" opacity=".8"/>
''')
write('route.svg', '''
<rect width="1080" height="1480" fill="#d8c7a7"/>
<rect x="55" y="67" width="970" height="1342" rx="15" fill="#e7d6b8" stroke="#ac946c" stroke-width="4"/>
<g opacity=".24" stroke="#897855" stroke-width="2" fill="none"><path d="M120 260 C380 170 480 350 890 270 M100 410 Q540 330 980 442 M116 563 Q489 485 960 557 M116 720 Q440 650 965 730 M120 875 Q580 810 970 934 M105 1060 Q580 1027 977 1112"/><path d="M220 100 V1350 M460 100 V1350 M760 100 V1350"/></g>
<path d="M249 398 C410 440 630 512 570 703 C550 777 645 849 748 1038" fill="none" stroke="#665f51" stroke-width="17" stroke-dasharray="14 25" stroke-linecap="round"/>
<path d="M249 398 C410 440 630 512 570 703 C550 777 645 849 748 1038" fill="none" stroke="#9b4d3c" stroke-width="6" stroke-dasharray="13 24" stroke-linecap="round"/>
<g fill="#243841" stroke="#d7bd8d" stroke-width="8"><circle cx="249" cy="398" r="28"/><circle cx="570" cy="703" r="28"/><circle cx="748" cy="1038" r="28"/></g>
<g font-family="Georgia,serif" fill="#2f444e"><text x="290" y="395" font-size="52">МИНСК</text><text x="610" y="695" font-size="48">СИМФЕРОПОЛЬ</text><text x="350" y="1110" font-size="52">СЕВАСТОПОЛЬ</text></g>
<path d="M113 1260 H970" stroke="#857c68" stroke-width="3"/><text x="133" y="1320" font-size="25" font-family="Georgia,serif" letter-spacing="6" fill="#86714e">ПО ВОСПОМИНАНИЯМ</text>
''')
write('sea.svg', '''
<rect width="1080" height="1480" fill="url(#dusk)"/>
<circle cx="780" cy="340" r="103" fill="#e0c8a9" opacity=".8"/>
<path d="M0 823 Q240 740 459 802 T1080 730 L1080 1480 H0Z" fill="#263b46"/>
<path d="M0 851 Q313 825 520 863 T1080 807 V1480 H0Z" fill="#112b35"/>
<path d="M0 907 H1080 V1480 H0Z" fill="url(#sea)"/>
<path d="M110 1032 Q411 989 790 1030 M0 1187 Q377 1152 1080 1212 M0 1338 Q427 1290 1080 1372" stroke="#abc0b7" stroke-width="4" fill="none" opacity=".22"/>
<path d="M170 854 H470 L440 912 H207Z" fill="#0a1b28"/><path d="M260 820 H360 V860 H260Z" fill="#0a1b28"/><path d="M290 736 H299 V821 H290Z" stroke="#0a1b28" stroke-width="15"/>
<path d="M0 782 L83 724 119 737 171 696 226 711 281 684 322 696 344 813 H0Z" fill="#182e39"/>
<path d="M831 750 L891 686 913 694 963 647 1008 657 1080 607 V923 H831Z" fill="#192f39"/>
''')
write('barracks.svg', '''
<rect width="1080" height="1480" fill="#172936"/>
<path d="M0 0 H1080 V1121 H0Z" fill="#263945"/>
<path d="M0 1050 L1080 980 V1480 H0Z" fill="#111f27"/>
<rect x="665" y="194" width="265" height="441" fill="#101f2a" stroke="#9f987f" stroke-width="17"/>
<path d="M799 192 V637 M673 410 H927" stroke="#9f987f" stroke-width="14"/>
<circle cx="803" cy="314" r="73" fill="#c1b594" opacity=".74"/>
<path d="M81 612 H599 M81 920 H599" stroke="#ae9879" stroke-width="19"/>
<path d="M124 380 V1128 M569 380 V1128" stroke="#ad9879" stroke-width="23"/>
<path d="M118 575 Q256 550 434 570 T585 579 V628 H118Z" fill="#657078"/>
<path d="M118 885 Q270 859 420 889 T585 884 V930 H118Z" fill="#69717b"/>
<path d="M135 474 H562 M135 776 H562" stroke="#dbb99a" stroke-width="4" opacity=".5"/>
<rect x="730" y="943" width="246" height="23" fill="#8d7c62"/>
<path d="M812 686 Q830 718 848 684 L897 744 902 979 H750 L755 746Z" fill="#0f2029" opacity=".9"/>
<path d="M118 1132 L0 1389 M568 1132 L706 1415" stroke="#7a6e5d" stroke-width="16"/>
''')
write('paper.svg', '''
<rect width="1080" height="1480" fill="#202d36"/>
<rect x="149" y="170" width="792" height="1202" rx="9" transform="rotate(4 540 740)" fill="#b5a386" opacity=".23"/>
<rect x="111" y="139" width="793" height="1180" rx="9" transform="rotate(-3 540 740)" fill="#e0cba7"/>
<g transform="rotate(-3 540 740)" stroke="#927d5c" stroke-width="4" opacity=".4"><path d="M190 410 H832 M190 479 H832 M190 547 H832 M190 615 H750 M190 705 H832 M190 773 H832 M190 842 H832 M190 909 H720 M190 1019 H832 M190 1087 H794"/></g>
<g transform="rotate(-3 540 740)" font-family="Georgia,serif" fill="#455360"><text x="189" y="285" font-size="50">19 НОЯБРЯ</text><text x="189" y="352" font-size="27" letter-spacing="6">НАЧАЛО ПУТИ</text></g>
<circle cx="723" cy="1115" r="101" fill="none" stroke="#b85d50" stroke-width="14" opacity=".37"/><path d="M659 1115 L785 1115" stroke="#b85d50" stroke-width="11" opacity=".32"/>
''')
print('Generated', len(list(p.glob('*.svg'))), 'svg images')
