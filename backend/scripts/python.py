import sys
import json
from automation_common import validation
from pydantic import ValidationError

return_value = ""
try:
    validation.validate(json.loads(sys.argv[1]))
except ValidationError as e:
    return_value = e

print(return_value)