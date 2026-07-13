import urllib.request
import json
inputInfo = json.loads(urllib.request.urlopen("https://raw.githubusercontent.com/avrae/avrae-service/master/static/template-attacks.json").read())
outputInfo = []
for feature in inputInfo:
    description = ""
    for t in feature["automation"]:
        if t["type"] == "text":
            description = t["text"]
    newInfo = {
        "name": feature["name"],
        "description": description,
        "automation": feature
    }
    outputInfo.append(newInfo)
with open('srdFeatures.json', 'w') as f:
    json.dump(outputInfo, f)
print("Updated data!")