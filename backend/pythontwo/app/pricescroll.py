from dhanhq import marketfeed
import time
import logging
from datetime import datetime
from pymongo import MongoClient

class PriceScroll:
    print('PriceScroll Run')
    def __init__(self, client_id, access_token):
        self.client_id = "1106727953"
        self.access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA"
        self.feed = None
        self.running = False
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def start(self):
        """Start the price scroll stream"""
        instruments = [
                     # Index data
    # (marketfeed.NSE, "1", marketfeed.Full),      
    # (marketfeed.NSE, "2", marketfeed.Full),      

    # Top Nifty 50 stocks (example stocks - replace with actual security IDs)
    (marketfeed.NSE, "3499", marketfeed.Full),      
    (marketfeed.NSE, "4306", marketfeed.Full),     
    (marketfeed.NSE, "10604", marketfeed.Full),     
    (marketfeed.NSE, "1363", marketfeed.Full),      
    (marketfeed.NSE, "13538", marketfeed.Full),     
    (marketfeed.NSE, "11723", marketfeed.Full),      
    (marketfeed.NSE, "5097", marketfeed.Full),      
    (marketfeed.NSE, "25", marketfeed.Full),      
    (marketfeed.NSE, "2475", marketfeed.Full),      
    (marketfeed.NSE, "1594", marketfeed.Full),    
    (marketfeed.NSE, "2031", marketfeed.Full), 
    (marketfeed.NSE, "16669", marketfeed.Full),       
    (marketfeed.NSE, "1964", marketfeed.Full),     
    (marketfeed.NSE, "11483", marketfeed.Full),     
    (marketfeed.NSE, "11723", marketfeed.Full),     
    (marketfeed.NSE, "1232", marketfeed.Full),      
    (marketfeed.NSE, "7229", marketfeed.Full),   
    (marketfeed.NSE, "2885", marketfeed.Full),       
    (marketfeed.NSE, "16675", marketfeed.Full),     
    (marketfeed.NSE, "11536", marketfeed.Full),     
    (marketfeed.NSE, "10999", marketfeed.Full),     
    (marketfeed.NSE, "18143", marketfeed.Full),      
    (marketfeed.NSE, "3432", marketfeed.Full),     
    (marketfeed.NSE, "3506", marketfeed.Full),      
    (marketfeed.NSE, "467", marketfeed.Full),    
    (marketfeed.NSE, "910", marketfeed.Full),    
    (marketfeed.NSE, "3787", marketfeed.Full),     
    (marketfeed.NSE, "15083", marketfeed.Full),     
    (marketfeed.NSE, "21808", marketfeed.Full),    
    (marketfeed.NSE, "1660", marketfeed.Full),     
    (marketfeed.NSE, "3045", marketfeed.Full),    
    (marketfeed.NSE, "157", marketfeed.Full), 
    (marketfeed.NSE, "881", marketfeed.Full),     
    (marketfeed.NSE, "4963", marketfeed.Full),    
    (marketfeed.NSE, "383", marketfeed.Full),     
    (marketfeed.NSE, "317", marketfeed.Full),
    (marketfeed.NSE, "11532", marketfeed.Full),    
    (marketfeed.NSE, "11630", marketfeed.Full),        
    (marketfeed.NSE, "3351", marketfeed.Full),      
    (marketfeed.NSE, "14977", marketfeed.Full),       
    (marketfeed.NSE, "1922", marketfeed.Full),     
    (marketfeed.NSE, "5258", marketfeed.Full),  
    (marketfeed.NSE, "5900", marketfeed.Full),      
    (marketfeed.NSE, "17963", marketfeed.Full),      
    (marketfeed.NSE, "1394", marketfeed.Full),    
    (marketfeed.NSE, "1333", marketfeed.Full),    
    (marketfeed.NSE, "1348", marketfeed.Full),   
    (marketfeed.NSE, "694", marketfeed.Full),   
    (marketfeed.NSE, "236", marketfeed.Full),  
    (marketfeed.NSE, "3456", marketfeed.Full),
        ]
        
        try:
            self.feed = marketfeed.DhanFeed(
                self.client_id,
                self.access_token,
                instruments,
                version="v2"
            )
            
            self.running = True
            logging.info("PriceScroll started")
            
            while self.running:
                self.feed.run_forever()
                response = self.feed.get_data()
                if response:
                    # Ensure we have all required fields
                    response['timestamp'] = datetime.now()
                    if 'close' not in response:
                        response['close'] = response.get('LTP', 0)  # Fallback
                    
                    mongo_uri = "mongodb://localhost:27017"
                    mongo_client = MongoClient(mongo_uri)
                    mongo_db = mongo_client['Upholic']
                    mongo_collection = mongo_db['live_data']
                    
                    # Update or insert the document
                    mongo_collection.update_one(
                        {'security_id': response['security_id']},
                        {'$set': response},
                        upsert=True
                    )
                    
                    print(f"PriceScroll Data: {response}")
                time.sleep(0.1)
                
        except Exception as e:
            logging.error(f"PriceScroll error: {str(e)}")
            self.stop()

    def stop(self):
        """Stop the price scroll stream"""
        self.running = False
        if self.feed:
            self.feed.disconnect()
        logging.info("PriceScroll stopped")