from pathlib import Path
import json,re,zipfile,hashlib
root=Path(__file__).resolve().parents[2];out=root/'production/chapter01'
style=json.loads((out/'visual-style.json').read_text());d=json.loads((out/'storyboard.json').read_text());old=json.loads((out/'private/revisions/2026-11-23-before-style/storyboard.json').read_text())
for key in ('slides','parts','chronology','sourceOfTruth','heroWardrobe','uniformInventory','heroAgeAtDraft','officerContinuity','totals'):
    assert d[key]==old[key],f'Canonical data changed: {key}'
for source in d['sourceOfTruth']:assert hashlib.sha256((out/source['file']).read_bytes()).hexdigest()==source['sha256']
assert d['visualStyleId']==style['id']
assert (out/'style-master-prompt.txt').read_text()==style['promptBlock']+'\n'
blocks=re.findall(r'```text\n(.*?)\n```',(out/'gpt-image-prompts.md').read_text(),re.S)
assert len(blocks)==41
for n,block in enumerate(blocks,1):
    assert block.startswith(style['promptBlock']+'\n\n'),n
    for term in ('контур переменной толщины','направленной штриховкой','печатной бумаги','тёплая охра','тёмно-синие','Старые рисунки S01–S03','R01','18 лет','Ноябрь 1990 года'):
        assert term in block,(n,term)
with zipfile.ZipFile(out/'gpt-image-prompts.zip') as z:
    assert z.testzip() is None
    for n,block in enumerate(blocks,1):assert z.read(f'{n:02d}.txt').decode()==block+'\n'
with zipfile.ZipFile(out/'private/style-reference-pack.zip') as z:
    assert z.testzip() is None
    assert len(z.namelist())==5
    assert z.read('MASTER-STYLE.txt').decode()==style['promptBlock']+'\n'
    for ref in style['styleReferences']:
        data=(out/ref['file']).read_bytes()
        assert hashlib.sha256(data).hexdigest()==ref['sha256']
        assert z.read(Path(ref['file']).name)==data
        assert ref['role']=='style_only'
        assert not str(ref['file']).startswith('/assets/')
for path in ('public/assets/cover.webp','public/assets/train.webp','public/assets/commissariat.webp'):
    assert not (root/path).exists(),f'Old public image restored: {path}'
print('PASS: one shared inspected-image style in all41 prompts and ZIP;3 private source hashes and5-entry style pack match; factual scenes/wardrobe/dates/source hashes unchanged; no old public assets restored.')
