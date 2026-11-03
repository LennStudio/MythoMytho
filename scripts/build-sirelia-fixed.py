"""
Fabrique assets/fonts/SireliaFixed.otf à partir de Sirelia.otf (original conservé tel quel) :
  1. supprime la fonctionnalité GSUB « liga » : ses 36 ligatures (« ca », « eu », « er », « em »…) sont des glyphes
     VIDES, ce qui faisait disparaître des lettres (« Nouvelle manche » → « Nouvle nche ») ;
  2. dessine l'apostrophe (U+0027 et U+2019), absente de Sirelia (glyphe vide) : sans elle, « L'Undercover » était
     composé avec l'apostrophe d'une autre police, avec un grand vide avant elle.

Usage (Python + fontTools) :  python scripts/build-sirelia-fixed.py
"""
from fontTools.ttLib import TTFont
from fontTools.pens.t2CharStringPen import T2CharStringPen

SRC, DST = 'assets/fonts/Sirelia.otf', 'assets/fonts/SireliaFixed.otf'
font = TTFont(SRC)

# --- 1) ligatures vides -------------------------------------------------------------------------------------------
gsub = font['GSUB'].table
old_tags = [fr.FeatureTag for fr in gsub.FeatureList.FeatureRecord]
keep = [i for i, t in enumerate(old_tags) if t != 'liga']
remap = {o: n for n, o in enumerate(keep)}
gsub.FeatureList.FeatureRecord = [gsub.FeatureList.FeatureRecord[i] for i in keep]
gsub.FeatureList.FeatureCount = len(keep)

def fix_lang(lang):
    lang.FeatureIndex = [remap[i] for i in lang.FeatureIndex if i in remap]
    lang.FeatureCount = len(lang.FeatureIndex)
    if lang.ReqFeatureIndex != 0xFFFF:
        lang.ReqFeatureIndex = remap.get(lang.ReqFeatureIndex, 0xFFFF)

for rec in gsub.ScriptList.ScriptRecord:
    if rec.Script.DefaultLangSys:
        fix_lang(rec.Script.DefaultLangSys)
    for ls in rec.Script.LangSysRecord:
        fix_lang(ls.LangSys)

# --- 2) apostrophe : coin effilé, à l'échelle des capitales (hauteur 1464, traits épais) --------------------------
cmap = font.getBestCmap()
cff = font['CFF '].cff
top = cff.topDictIndex[0]
CAP = 1464
ADVANCE, LSB = 250, 55
pts = [  # haut large, pointe basse légèrement penchée
    (LSB, CAP), (LSB + 130, CAP), (LSB + 118, CAP - 330), (LSB + 52, CAP - 470), (LSB + 28, CAP - 330),
]
for cp in (0x27, 0x2019):
    name = cmap[cp]
    pen = T2CharStringPen(ADVANCE, None)
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()
    top.CharStrings[name] = pen.getCharString(private=top.Private, globalSubrs=cff.GlobalSubrs)
    font['hmtx'][name] = (ADVANCE, LSB)

font.save(DST)
print('écrit', DST)
