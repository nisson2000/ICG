import json
import re
'''
file = 'Teapot.json'
with open(file, 'r') as obj:
    data = json.load(obj)

print(data)
'''
f = open('lower.txt','r')
normal = []
verts = []
color = []
data = f.read()
s = re.split('{|}',data)
for x in range(len(s)):
	if len(s[x]) > 1:
		r1 = s[x].replace('[','')
		r2 = r1.replace(']','')
		n = re.split(',|:',r2)
		for i in range(1,4):
			for j in range(3):
				normal.append(float(n[i]))
				color.append(0.5)
				pass
			pass
		for i in range(5,14):
			verts.append(float(n[i]))
			pass
	pass
print(len(normal))
print(len(verts))
print(len(color))
f.close()

L = {"vertexPositions":verts, "vertexNormals":normal,"vertexFrontcolors":color,"vertexBackcolors":color}
file = 'newlower.json'
with open(file, 'w') as obj:
    json.dump(L, obj)
obj.close()