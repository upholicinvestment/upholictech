# main.py (updated)
import logging
import time
import sys
from multiprocessing import Process
from instruments.nse_equity import NSEEquityFeed
from instruments.nse_index import NSEIndexFeed
from instruments.nse_fno import NSEFNOFeed
from instruments.bse_equity import BSEEquityFeed
from instruments.bse_index import BSEIndexFeed
from instruments.bse_fno import BSEFNOFeed

def configure_logging():
    """Configure logging for the application"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('market_feeds.log')
        ]
    )

def run_feed(feed_class):
    """Run a market feed in a loop with error handling"""
    logger = logging.getLogger(feed_class.__name__)
    while True:
        try:
            feed = feed_class()
            logger.info(f"Starting {feed_class.__name__} feed")
            feed.start_feed()
        except Exception as e:
            logger.error(f"Error in {feed_class.__name__}: {str(e)}", exc_info=True)
            time.sleep(30)  # Wait before restarting

def main():
    """Main application entry point"""
    configure_logging()
    logger = logging.getLogger('Main')
    
    processes = []
    feed_classes = [
        NSEEquityFeed,
        NSEIndexFeed,
        NSEFNOFeed,
        BSEEquityFeed,
        BSEIndexFeed,
        BSEFNOFeed
    ]
    
    try:
        logger.info("Starting all market data feeds...")
        
        # Create and start processes for each feed
        for feed_class in feed_classes:
            p = Process(target=run_feed, args=(feed_class,))
            p.start()
            processes.append(p)
            time.sleep(1)  # Stagger process starts
        
        logger.info("All market data feeds started")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Shutting down all feeds...")
        for p in processes:
            p.terminate()
            p.join(timeout=5)
        logger.info("All feeds stopped")
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
    finally:
        logging.shutdown()

if __name__ == "__main__":
    main()