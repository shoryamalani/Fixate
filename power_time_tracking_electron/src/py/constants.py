import os
import sys

if sys.platform == "win32":
    OLD_DATABASE_LOCATION = f"{os.path.expanduser( '~' )}/PowerTimeTracking"
    DATABASE_LOCATION = f"{os.path.expanduser( '~' )}/.Fixate"
    LOGGER_LOCATION = f"{os.path.expanduser( '~' )}/.Fixate/logs/log.log"
else:
    OLD_DATABASE_LOCATION = f"{os.getenv('HOME')}/.PowerTimeTracking"
    DATABASE_LOCATION = f"{os.getenv('HOME')}/.Fixate"
    LOGGER_LOCATION = f"{os.getenv('HOME')}/.Fixate/logs/log.log"

WORKFLOW_LOCATION = "."


DATABASE_NAME = "time_database.db"
API_URL = "https://api.powertimetracking.shoryamalani.com"
BETA_API_URL = "http://localhost:5008"