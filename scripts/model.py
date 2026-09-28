"""Reproducible, millimetre CAD concept. Rhino 7 compatible .3dm."""
from pathlib import Path
import math, json
import rhino3dm as r

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'dist'/'assets'
doc=r.File3dm()
doc.ApplicationName='PIXEL / RAIL Concept Studio'
doc.ApplicationDetails='Editable concept geometry. Nominal mm. Not production tooling.'
doc.Settings.ModelUnitSystem=r.UnitSystem.Millimeters
doc.Settings.ModelAbsoluteTolerance=.01
doc.Settings.ModelAngleToleranceDegrees=1
doc.Strings['Project']='PIXEL / RAIL - vehicle side window display'
doc.Strings['Dimensions']='Module envelope 240 x 120 x 12 mm; 3 modules; 2 mm assembly gap; rail length 1120 mm'
doc.Strings['Coordinate system']='X along rail, Y up, Z toward cabin'
doc.Strings['Design status']='Concept only. Rail/base fit, wiring, retention and vehicle interface not production engineered.'

def layer(name,color,parent=None,visible=True):
    l=r.Layer();l.Name=name;l.Color=(*color,255);l.Visible=visible
    if parent is not None:l.ParentLayerId=doc.Layers[parent].Id
    return doc.Layers.Add(l)

screens=layer('01 屏幕模组',(48,62,70))
rails=layer('02 滑槽轨道',(158,175,185))
bases=layer('03 车侧安装基座',(85,109,120))
env=layer('04 车窗与门板_参考环境',(66,86,98),visible=False)
anno=layer('05 尺寸与说明',(195,215,223))
railbody=layer('C形连续轨道_1120mm',(168,184,191),rails)
railend=layer('左端止挡_右端装入',(76,94,104),rails)
basebody=layer('可调安装座_概念',(80,109,120),bases)
pads=layer('柔性衬垫',(29,40,44),bases)

def attrs(name,li,group=None):
    a=r.ObjectAttributes();a.Name=name;a.LayerIndex=li
    if group is not None:a.AddToGroup(group)
    return a

def addbox(name,li,w,h,d,x,y,z,group=None):
    b=r.Brep.CreateFromBoundingBox(r.BoundingBox(x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2))
    a=attrs(name,li,group);a.SetUserString('Nominal dimensions mm',f'{w} x {h} x {d}')
    doc.Objects.AddBrep(b,a)

def group(name):
    g=r.Group();g.Name=name;doc.Groups.Add(g);return len(doc.Groups)-1

def pixel_kind(x,y):
    # Static snapshot matching the browser's puppy at t=0.
    warm=[(42,9,31,8),(46,7,24,3),(70,5,11,12),(76,8,11,6),(72,2,4,7),(67,4,6,7),(43,16,4,4),(48,19,4,2),(65,16,4,5),(69,19,4,2),(38,6,6,5),(36,2,3,6)]
    if 80<=x<82 and 7<=y<9:return 0
    if 70<=x<81 and y==15:return 2
    if any(a<=x<a+w and b<=y<b+h for a,b,w,h in warm):return 1
    for hx,hy in [(12,5),(118,8)]:
        mask=['0110110','1111111','1111111','0111110','0011100','0001000']
        if hx<=x<hx+7 and hy<=y<hy+6 and mask[y-hy][x-hx]=='1':return 1
    if y==21+round(math.sin(x*.14)):return 2
    return 0

def ledmesh(cx,mode):
    mesh=r.Mesh()
    for y in range(24):
        for x in range(48):
            global_x=int((cx+242)/242)*48+x
            if pixel_kind(global_x,y)!=mode:continue
            # Separate circular LED lenses, grouped into one editable mesh per module.
            xx=cx+(x-23.5)*4.75;yy=(11.5-y)*4.75;rad=1.1;n=10
            b=len(mesh.Vertices)
            for z in (6.5,6.95):
                for k in range(n):
                    th=k*2*math.pi/n;mesh.Vertices.Add(xx+rad*math.cos(th),yy+rad*math.sin(th),z)
            for k in range(n):mesh.Faces.AddFace(b+k,b+(k+1)%n,b+n+(k+1)%n,b+n+k)
            for k in range(1,n-1):
                mesh.Faces.AddFace(b,b+k+1,b+k)
                mesh.Faces.AddFace(b+n,b+n+k,b+n+k+1)
    mesh.Normals.ComputeNormals();mesh.Compact();return mesh

for i,cx in enumerate((-242,0,242),1):
    root=layer(f'模组_{i:02}',(43,59,65),screens)
    case=layer('铝合金外壳_240x120x12',(38,48,54),root)
    front=layer('前面板',(12,19,24),root)
    dots=layer('LED透镜_未点亮',(36,49,55),root)
    amber=layer('LED透镜_小狗琥珀色',(246,171,91),root)
    cyan=layer('LED透镜_青色波浪',(90,193,198),root)
    shoes=layer('T形滑块',(91,185,183),root)
    gr=group(f'Module {i} 240x120 mm')
    # Back shell + four perimeter strips form an actual hollow frame rather than an overlapping solid slab.
    addbox(f'M{i} rear shell 240x120',case,240,120,2,cx,0,-5,gr)
    addbox(f'M{i} frame left',case,5,120,10,cx-117.5,0,1,gr)
    addbox(f'M{i} frame right',case,5,120,10,cx+117.5,0,1,gr)
    addbox(f'M{i} frame top',case,230,2.5,10,cx,58.75,1,gr)
    addbox(f'M{i} frame bottom',case,230,2.5,10,cx,-58.75,1,gr)
    addbox(f'M{i} black front panel',front,230,115,1,cx,0,5.5,gr)
    addbox(f'M{i} display PCB',front,226,110,1.6,cx,0,2.4,gr)
    for mode,li in enumerate((dots,amber,cyan)):
        doc.Objects.AddMesh(ledmesh(cx,mode),attrs(f'M{i} LED lenses P4.75 palette {mode}',li,gr))
    for j,sx in enumerate((-76,76),1):
        addbox(f'M{i} shoe {j} retained flange',shoes,26,5,20,cx+sx,-70,0,gr)
        addbox(f'M{i} shoe {j} neck',shoes,16,10,10,cx+sx,-62.5,0,gr)

# Closed extrusion of a single C cross-section, not five coincident bars.
# Draw the cross-section in XY: X maps to Z, Y remains Y; extrude along local Z then rotate to world X.
profile=[(-15,-78),(15,-78),(15,-60),(7,-60),(7,-63),(12,-63),(12,-75),(-12,-75),(-12,-63),(-7,-63),(-7,-60),(-15,-60),(-15,-78)]
curve=r.PolylineCurve([r.Point3d(z,y,0) for z,y in profile])
extr=r.Extrusion.Create(curve,1120,True)
assert extr is not None
extr.Transform(r.Transform.Rotation(math.pi/2,r.Vector3d(0,1,0),r.Point3d(0,0,0)))
extr.Transform(r.Transform.Translation(-560,0,0))
doc.Objects.AddExtrusion(extr,attrs('C rail 1120 x 18 x 30 mm; opening 14 mm',railbody))
addbox('Fixed end stop; right end remains open for insertion',railend,7,19,32,-563.5,-69,0)
for i,x in enumerate((-474,0,474),1):
    gr=group(f'Mount {i}')
    addbox(f'Mount {i} rail saddle',basebody,86,10,65,x,-83,-12,gr)
    addbox(f'Mount {i} backing plate',basebody,70,37,8,x,-105,-40,gr)
    addbox(f'Mount {i} soft liner',pads,80,4,61,x,-90,-12,gr)

addbox('Generic door card - illustrative only',env,1120,200,45,0,-205,-60)
addbox('Generic window - illustrative only',env,1010,380,4,0,110,-52)

def note(text,p):doc.Objects.AddTextDot(text,r.Point3d(*p),attrs(text,anno))
def line(a,b):doc.Objects.AddLine(r.Point3d(*a),r.Point3d(*b),attrs('Dimension guide',anno))
line((-362,85,0),(-122,85,0));line((-362,62,0),(-362,94,0));line((-122,62,0),(-122,94,0));note('240 mm',(-242,95,0))
line((-390,-60,0),(-390,60,0));note('120 mm',(-411,0,0))
line((-560,-148,0),(560,-148,0));note('C rail 1120 mm',(0,-155,0))
note('3 x 240x120 mm / 2 mm physical gaps / 144x24 logical pixels',(0,140,0))
note('CONCEPT / nominal mm / vehicle interface to be engineered',(0,-198,0))

view=r.ViewInfo();view.Name='Pixel Rail - assembly';view.Viewport=r.ViewportInfo.DefaultPerspective()
view.Viewport.SetCameraLocation(r.Point3d(900,600,1400));view.Viewport.SetCameraDirection(r.Vector3d(-900,-600,-1400));view.Viewport.SetCameraUp(r.Vector3d(0,1,0));
doc.Views.Add(view)
OUT.mkdir(parents=True,exist_ok=True)
path=OUT/'pixel-rail.3dm'
assert doc.Write(str(path),7)

# Reopen independently and validate deliverable, including all BReps/meshes/extrusions.
read=r.File3dm.Read(str(path));assert read and read.Settings.ModelUnitSystem==r.UnitSystem.Millimeters
invalid=[];envelopes=[]
for ob in read.Objects:
    if not ob.Geometry.IsValid:invalid.append(ob.Attributes.Name)
    if 'rear shell' in ob.Attributes.Name:
        bb=ob.Geometry.GetBoundingBox();dims=[bb.Max.X-bb.Min.X,bb.Max.Y-bb.Min.Y,bb.Max.Z-bb.Min.Z]
        assert dims==[240,120,2],dims
        envelopes.append(dims)
assert not invalid,invalid
assert len(envelopes)==3
report={'file':str(path),'rhino_version':7,'units':'millimeters','layers':len(read.Layers),'objects':len(read.Objects),'valid_geometry':True,'module_envelopes_mm':[[240,120,12]]*3,'physical_gap_mm':2,'rail_length_mm':1120,'rail_cross_section_mm':[18,30],'top_opening_mm':14,'shoe_flange_depth_mm':20,'notes':'LED lenses protrude 0.95 mm beyond nominal housing front. Rhino CAD is a concept assembly.'}
(OUT/'model-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
