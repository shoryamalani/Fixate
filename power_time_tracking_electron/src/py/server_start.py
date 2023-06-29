import multiprocessing
import server
import time
# from multiprocessing import freeze_support
if __name__ == "__main__":
    multiprocessing.Process(target=server.start_server).start()
    print("Server started")
    # import subprocess
    # subprocess.Popen(["python", "server.py"])