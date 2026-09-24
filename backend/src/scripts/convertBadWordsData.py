#Convert bad words from "naughty-words" package to bad-words-next package format

import os
import json
with os.scandir('badwordsData/') as entries:
    for entry in entries:
        if entry.is_dir(): continue
        print(entry.path)
        data = json.load(open(entry.path))
        if not "id" in data:
            newData = {
                "id": entry.name.removesuffix(".json"),
                "words": data,
                "lookalike": {}
            }
            open(entry.path, "w").write(json.dumps(newData, ensure_ascii=False))