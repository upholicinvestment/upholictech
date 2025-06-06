# # main.py (updated)
# from instruments.nse_equity import NSEEQUITY
# from instruments.nse_fno import NSEFNOFeed
# from instruments.nse_fno_index import NSEFNOINDEX
# from instruments.bse_equity import BSEEQUITY
# from instruments.bse_fno import BSEFNOFeed
# from instruments.bse_fno_index import BSEFNOINDEX
# from multiprocessing import Process
# import logging
# import time
# import sys

# def configure_logging():
#     """Configure logging for the application"""
#     logging.basicConfig(
#         level=logging.INFO,
#         format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#         handlers=[
#             logging.StreamHandler(sys.stdout),
#             logging.FileHandler('market_feeds.log')
#         ]
#     )

# def run_feed(feed_class):
#     """Run a market feed in a loop with error handling"""
#     logger = logging.getLogger(feed_class.__name__)
#     while True:
#         try:
#             feed = feed_class()
#             logger.info(f"Starting {feed_class.__name__} feed")
            
#             # Call the appropriate method based on class
#             if hasattr(feed, 'start_market_feed'):
#                 feed.start_market_feed()  # For BSEEQUITY
#             elif hasattr(feed, 'run'):
#                 feed.run()  # For BSEFNOINDEX and BSEFNOFeed
#             else:
#                 logger.error(f"Class {feed_class.__name__} has no recognized start method")
#                 break
                
#         except Exception as e:
#             logger.error(f"Error in {feed_class.__name__}: {str(e)}", exc_info=True)
#             time.sleep(30)  # Wait before restarting

# def main():
#     """Main application entry point"""
#     configure_logging()
#     logger = logging.getLogger('Main')
    
#     try:
#         logger.info("Starting all market data feeds...")
        
#         # Create processes for each feed
#         processes = [
#             Process(target=run_feed, args=(NSEEQUITY,)),
#             Process(target=run_feed, args=(NSEFNOINDEX,)),
#             Process(target=run_feed, args=(NSEFNOFeed,)),
#             Process(target=run_feed, args=(BSEEQUITY,)),
#             Process(target=run_feed, args=(BSEFNOINDEX,)),
#             Process(target=run_feed, args=(BSEFNOFeed,))
#         ]
        
#         # Start all processes
#         for p in processes:
#             p.start()
        
#         logger.info("All market data feeds started")
        
#         # Keep main thread alive
#         while True:
#             time.sleep(1)
            
#     except KeyboardInterrupt:
#         logger.info("Shutting down all feeds...")
#         for p in processes:
#             p.terminate()
#             p.join()
#         logger.info("All feeds stopped")
#     except Exception as e:
#         logger.error(f"Application error: {str(e)}", exc_info=True)
#     finally:
#         logging.shutdown()

# if __name__ == "__main__":
#     main()

# main.py
import subprocess
import sys
import os
import signal
import time
from datetime import datetime, time as dt_time, timedelta
import pytz

# Base folder where your scripts are located
BASE_PATH = r"/home/ubuntu/python/app/instruments"

# List of Python scripts to run
SCRIPTS = [
    "bse_equity.py",
    "bse_fno_index.py",
    "bse_fno.py",
    "nse_equity.py",
    "nse_fno_index.py",
    "nse_fno.py"
]

# Store all subprocess objects
processes = []

# Timezone setup
IST = pytz.timezone('Asia/Kolkata')

# Market hours (9:15 AM to 3:30 PM IST)
MARKET_OPEN = dt_time(9, 15)
MARKET_CLOSE = dt_time(15, 30)

def is_market_open():
    """Check if current time is within market hours"""
    now = datetime.now(IST)
    current_time = now.time()
    
    # Monday to Friday (0 is Monday, 6 is Sunday)
    if now.weekday() >= 5:  # Saturday or Sunday
        return False
    
    return MARKET_OPEN <= current_time <= MARKET_CLOSE

def start_all():
    """Start all market feed scripts"""
    for script in SCRIPTS:
        path = os.path.join(BASE_PATH, script)
        print(f"Starting {script}...")
        proc = subprocess.Popen([sys.executable, path])
        processes.append(proc)

def stop_all():
    """Stop all market feed scripts"""
    print("Stopping all scripts...")
    for proc in processes:
        try:
            proc.send_signal(signal.SIGINT)
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.terminate()
        except Exception as e:
            print(f"Error stopping process: {e}")
    processes.clear()
    print("All scripts stopped.")

def wait_until(target_time):
    """Wait until the target time (datetime.time object)"""
    now = datetime.now(IST)
    target = datetime.combine(now.date(), target_time).astimezone(IST)
    
    if now >= target:
        target = datetime.combine(now.date() + timedelta(days=1), target_time).astimezone(IST)
    
    seconds_to_wait = (target - now).total_seconds()
    print(f"Waiting {seconds_to_wait/60:.1f} minutes until {target_time.strftime('%H:%M')} IST...")
    time.sleep(seconds_to_wait)

def main_loop():
    """Main control loop that manages the scripts based on market hours"""
    try:
        while True:
            if is_market_open():
                if not processes:  # If not already running
                    print("Market is open - starting feeds...")
                    start_all()
                
                # Wait until market close
                now = datetime.now(IST)
                close_time = datetime.combine(now.date(), MARKET_CLOSE).astimezone(IST)
                seconds_remaining = (close_time - now).total_seconds()
                
                if seconds_remaining > 0:
                    print(f"Market open - waiting {seconds_remaining/60:.1f} minutes until close...")
                    time.sleep(min(seconds_remaining, 60))  # Check every minute or until close
            else:
                if processes:  # If running outside market hours
                    print("Market is closed - stopping feeds...")
                    stop_all()
                
                # Wait until next market open
                wait_until(MARKET_OPEN)
                
    except KeyboardInterrupt:
        print("Received interrupt - shutting down...")
        stop_all()
    except Exception as e:
        print(f"Error in main loop: {e}")
        stop_all()

if __name__ == "__main__":
    print("Market Feed Launcher started")
    print(f"Market hours: {MARKET_OPEN.strftime('%H:%M')} to {MARKET_CLOSE.strftime('%H:%M')} IST")
    
    # Start with appropriate state
    if is_market_open():
        print("Market is currently open - starting feeds")
        start_all()
    else:
        print("Market is currently closed - waiting for next open")
    
    # Enter main control loop
    main_loop()