import sys
from PIL import Image
files=sys.argv[2:]; out=sys.argv[1]
ims=[Image.open(f).convert('RGB') for f in files]
H=900
ims=[im.resize((int(im.width*H/im.height),H)) if im.height<=im.width*3 else im.crop((0,0,im.width,im.width*3)).resize((int(H/3),H)) for im in ims]
W=sum(i.width for i in ims)+10*(len(ims)-1)
sheet=Image.new('RGB',(W,H),'#888')
x=0
for i in ims: sheet.paste(i,(x,0)); x+=i.width+10
sheet.save(out)
