"""Create portable deliverables, excluding caches, credentials and dependencies."""
from pathlib import Path
import zipfile, json

root=Path(__file__).resolve().parents[1]
out=root.parent/'output'/'pixel-rail-delivery.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    for f in sorted((root/'dist').rglob('*')):
        if f.is_file():z.write(f, 'PIXEL-RAIL/'+f.relative_to(root/'dist').as_posix())
    for folder in ['src','scripts']:
        for f in sorted((root/folder).rglob('*')):
            if f.is_file():z.write(f,'PIXEL-RAIL/source/'+f.relative_to(root).as_posix())
    for name in ['package.json','package-lock.json','DESIGN.md']:
        z.write(root/name,'PIXEL-RAIL/source/'+name)
    # Include source assets so npm run build can reproduce a complete local demo.
    for name in ['concept.png','pixel-rail.3dm','README.txt','render-prompt.txt']:
        z.write(root/'dist'/'assets'/name,'PIXEL-RAIL/source/dist/assets/'+name)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    names=z.namelist()
    assert all('node_modules' not in n and '/.git/' not in n for n in names)
    for need in ['PIXEL-RAIL/pixel-rail-offline.html','PIXEL-RAIL/assets/pixel-rail.3dm','PIXEL-RAIL/assets/concept.png']:
        assert need in names
print(json.dumps({'zip':str(out),'bytes':out.stat().st_size,'files':len(names),'verified':True}))
