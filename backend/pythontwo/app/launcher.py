# # launcher.py
# import subprocess
# import sys
# import os
# import signal
# import time

# # Base folder where your scripts are located
# BASE_PATH = r"D:\upholic_tech\backend\pythontwo\app\instruments"

# # List of Python scripts to run
# SCRIPTS = [
#     "bse_equity.py",
#     "bse_fno_index",
#     "bse_fno.py",
#     "nse_equity.py",
#     "nse_fno_index.py",
#     "nse_fno.py"

# ]

# # Store all subprocess objects
# processes = []

# def start_all():
#     for script in SCRIPTS:
#         path = os.path.join(BASE_PATH, script)
#         print(f"Starting {script}...")
#         proc = subprocess.Popen([sys.executable, path])
#         processes.append(proc)

# def stop_all():
#     print("Stopping all scripts...")
#     for proc in processes:
#         try:
#             proc.send_signal(signal.SIGINT)
#             proc.wait()
#         except Exception as e:
#             print(f"Error stopping process: {e}")
#     print("All scripts stopped.")

# if __name__ == "__main__":
#     try:
#         start_all()
#         while True:
#             time.sleep(1)
#     except KeyboardInterrupt:
#         stop_all()
