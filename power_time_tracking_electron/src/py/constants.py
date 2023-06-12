import os
import sys

if sys.platform == "win32":
    DATABASE_LOCATION = f"{os.path.expanduser( '~' )}/.PowerTimeTracking"
    LOGGER_LOCATION = f"{os.path.expanduser( '~' )}/.PowerTimeTracking/logs/log.log"
else:
    DATABASE_LOCATION = f"{os.getenv('HOME')}/.PowerTimeTracking"
    LOGGER_LOCATION = f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log"

DATABASE_NAME = "time_database.db"