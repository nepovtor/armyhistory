from pathlib import Path
import json,re,zipfile,hashlib
root=Path(__file__).resolve().parents[2];p=root/'production/chapter01'
md=(p/'gpt-image-prompts.md').read_text();blocks=re.findall(r'```text\n(.*?)\n```',md,re.S)
assert len(blocks)==41 and md.count('```')==82
assert re.findall(r'^### (\d{2})\.',md,re.M)==[f'{n:02d}' for n in range(1,42)]
assert len(re.findall(r'^## Часть ',md,re.M))==3
sections=('РЕФЕРЕНСЫ И НЕПРЕРЫВНОСТЬ','КОМПОЗИЦИЯ','ПЕРСОНАЖИ И ДЕТАЛИ','СВЕТ И ЦВЕТ','ЭМОЦИЯ СЦЕНЫ','ОГРАНИЧЕНИЯ ЭТОГО ИЗОБРАЖЕНИЯ','ТРЕБОВАНИЯ К РЕЗУЛЬТАТУ')
for n,block in enumerate(blocks,1):
    assert len(re.findall(r'\b\w+\b',block))>=200,n
    assert all(x in block for x in sections)
    assert 'Герою 18 лет' in block and 'Вертикальная композиция 3:4' in block
    assert 'R01' in block and 'R02' in block and 'R04' in block
    assert not any(x in block.lower() for x in ('липсинк','fps','закадров','тайминг','звуковые эффекты'))
    assert all(line==line.rstrip() for line in block.splitlines()),n
assert all('старые порванные джинсы' in blocks[n-1] for n in range(1,25))
assert all('широкие тёмно-синие брюки' in blocks[n-1] for n in range(26,33))
assert 'удар ногой в голову' in blocks[14]
assert 'у стены' in blocks[17]
assert 'не мог отказаться' in blocks[24]
assert 'другой человек' in blocks[25]
assert 'радист — наиболее вероятная специальность' in blocks[30]
assert all('парадной морской форме' in blocks[n-1] and 'бескозырк' in blocks[n-1] for n in range(35,41))
assert '23 ноября' in blocks[36] and 'снег' in blocks[36]
assert 'кузове грузовика' in blocks[37] and 'неустановлены' not in blocks[37]
assert 'акустики' in blocks[38] and 'шестьдесят' in blocks[38]
assert 'нижней койке' in blocks[40] and 'ретроспективному итогу' in blocks[40]
with zipfile.ZipFile(p/'gpt-image-prompts.zip') as z:
    assert z.testzip() is None
    assert set(z.namelist())=={'README.txt'}|{f'{n:02d}.txt' for n in range(1,42)}
    for n,block in enumerate(blocks,1):assert z.read(f'{n:02d}.txt').decode()==block+'\n',n
story=json.loads((p/'storyboard.json').read_text())
for src in story['sourceOfTruth']:assert hashlib.sha256((p/src['file']).read_bytes()).hexdigest()==src['sha256']
assert all(s['imageFile'] is None and s['animationFile'] is None for s in story['slides'])
print('PASS: 41 complete GPT prompts;3 parts;photo reference rules/18yo; updated kick/wall/officer/trousers/probable specialty/uniform/travel/team/bunks;ZIP has41 matching TXT + README; sources unchanged; no images claimed.')
