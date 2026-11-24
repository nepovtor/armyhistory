from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parents[2];p=root/'production/chapter01'
d=json.loads((p/'storyboard.json').read_text());ss=d['slides'];t=d['totals'];by={s['number']:s for s in ss}
original=Path('/Users/nepovtor/.codex/attachments/45d17130-d2ee-450d-8323-366cf59c9180/Pasted text.txt').read_bytes()
assert (p/d['sourceFile']).read_bytes()==original
for source in d['sourceOfTruth']:
    assert hashlib.sha256((p/source['file']).read_bytes()).hexdigest()==source['sha256'],source['file']
assert [s['number'] for s in ss]==list(range(1,42))
assert len({s['id'] for s in ss})==41
assert [len(part['slides']) for part in d['parts']]==[10,11,20]
assert t['keyIllustrations']==t['storySlides']==41
assert t['actingEpisodes']==sum(s['animationClass']=='acting' for s in ss)==27
assert t['heldShots']==sum(s['animationClass']=='held' for s in ss)==14
assert t['durationSec']==sum(s['durationSec'] for s in ss)==703
assert t['keyPoseDrawings']==sum(len(s['actionKeys']) for s in ss if s['animationClass']=='acting')==105
assert set(d['backgrounds'])=={s['background'] for s in ss}
assert len(d['backgrounds'])==t['backgroundMasters']==15
assert d['heroAgeAtDraft']==18
assert by[15]['eventDurationSecApprox']==20 and by[18]['eventDurationSecApprox']==60
for term in ('ногой в голову','капитан'):
    assert term in by[15]['text'].lower(),term
assert all(term in by[18]['text'] for term in ('кулаками и ногами','к стене','чтобы не упасть'))
assert 'всё равно бы забрали' in by[25]['text'] and 'тёмно-синие' in by[25]['text']
assert 'другой офицер' in by[26]['text']
assert 'скорее всего радистом' in by[31]['text'] and 'радист' not in by[31]['title'].lower()
assert d['uniformInventory']['stripedUndershirts']==3 and d['uniformInventory']['sockPairs']==4
assert d['uniformInventory']['peaklessCapRibbon']=='Балтийский флот'
assert 'на поезде' in by[36]['text'] and '23 ноября' in by[37]['text']
assert 'на грузовиках' in by[38]['text']
assert all(term in by[39]['text'] for term in ('радисты','акустики','электрики','примерно шестьдесят'))
assert 'первом ярусе' in by[41]['text'] and '25 ноября' in by[41]['text']
assert 'Тест сдать согласен, а там посмотрим' in by[12]['text']
assert 'Пока не знаю' not in json.dumps(ss,ensure_ascii=False)
script=(p/'script.md').read_text();plan=(p/'production-plan.md').read_text();mini=(p/'image-prompts.md').read_text()
assert len(re.findall(r'^## Часть ',script,re.M))==3
assert len(re.findall(r'^#### \d{2}\.',plan,re.M))==41
assert len(re.findall(r'^### \d{2}\.',mini,re.M))==41
lines=original.decode().splitlines();covered=set()
for s in ss:
    if s.get('sourceLines'):
        a,b=s['sourceLines']['from'],s['sourceLines']['to'];assert 1<=a<=b<=len(lines)
        covered.update(range(a,b+1))
    if s['number']>=37:assert s.get('clarificationAnswers')
    assert all(s.get(k) for k in ('imagePrompt','sound','transition','shotSize'))
    assert s['status']=='planned' and s['imageFile'] is None and s['animationFile'] is None
    assert (s['animationClass']=='acting')==bool(s['actionKeys'])
    assert s['text'] in script and s['text'] in plan
    assert plan.count(f"#### {s['number']:02d}. {s['title']}\n")==1
for n,line in enumerate(lines,1):
    if line.strip() and not line.startswith('#'):assert n in covered,(n,line)
for part in d['parts']:
    group=[s for s in ss if s['part']==part['number']]
    assert part['durationSec']==sum(s['durationSec'] for s in group)
    assert part['wordCount']==sum(s['wordCount'] for s in group)
print('PASS: both source hashes; 41 scenes (10/11/20), no duplicates; 27 action/14 held;15 backgrounds;703s estimate;18yo; dates and retrospective25; same sparring captain/different returning officer; kick/defense/coercive trousers/probable radio; uniforms/train/trucks/team/bunks; source references; all outputs honestly planned.')
