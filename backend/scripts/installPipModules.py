import subprocess
import sys
def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])
#Modules:
install('git+https://github.com/avrae/automation-common.git')
install('pydantic')
install('typing')
