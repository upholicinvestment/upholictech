# main.py
from dhan_client import DhanClient
from pricescroll import PriceScroll
from multiprocessing import Process
from datetime import datetime
import time
import logging
import sys

def configure_logging():
    """Configure logging for the application"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('dhan_feed.log')
        ]
    )

def run_dhan_client():
    """Run the Dhan client in a separate process"""
    logger = logging.getLogger('DhanClientProcess')
    dhan = DhanClient()
    while True:
        try:
            logger.info("Starting market feed...")
            dhan.start_market_feed()
            logger.warning("Market feed stopped, restarting in 30 seconds...")
            time.sleep(30)
        except Exception as e:
            logger.error(f"DhanClient error: {str(e)}", exc_info=True)
            time.sleep(60)

def main():
    """Main application entry point"""
    configure_logging()
    logger = logging.getLogger('Main')
    
    try:
        logger.info("Starting application processes...")
        
        # Create processes
        dhan_process = Process(target=run_dhan_client)
        
        # Start processes
        dhan_process.start()
        
        logger.info("Processes started. Main thread waiting...")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Shutting down services...")
        dhan_process.terminate()
        dhan_process.join()
        logger.info("All services stopped")
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
    finally:
        logging.shutdown()

if __name__ == "__main__":
    main()