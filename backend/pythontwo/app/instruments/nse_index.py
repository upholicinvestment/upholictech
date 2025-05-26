# instruments/nse_index.py
import logging
from dhanhq import marketfeed
from datetime import datetime
from pymongo import MongoClient
import os
import pandas as pd

class NSEIndexFeed:
    def __init__(self):
        self.logger = logging.getLogger('NSEIndexFeed')
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA')
        self.mongo_client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
        self.db = self.mongo_client['Upholic']
        self.collection = self.db['nse_index']
        self.instruments = self._fetch_all_nse_indices()
        
    def _fetch_all_nse_indices(self):
        """Fetch all NSE index instruments from Dhan's master CSV"""
        url = "https://images.dhan.co/api-data/api-scrip-master.csv"
        self.logger.info(f"Fetching all NSE indices from: {url}")
        
        try:
            dtype = {
                'SEM_EXM_EXCH_ID': str,
                'SEM_SEGMENT': str,
                'SEM_SMST_SECURITY_ID': str,
                'SEM_INSTRUMENT_NAME': str,
                'SEM_TRADING_SYMBOL': str
            }
            
            df = pd.read_csv(url, dtype=dtype, low_memory=False)
            
            # Filter for NSE indices (segment C or I, instrument type INDEX)
            index_df = df[
                (df['SEM_EXM_EXCH_ID'] == 'NSE') & 
                (df['SEM_SEGMENT'].isin(['C', 'I'])) &  # C = Capital Market, I = Institutional
                (df['SEM_INSTRUMENT_NAME'] == 'INDEX')
            ]
            
            self.logger.info(f"Found {len(index_df)} NSE indices")
            
            # Log all found indices for verification
            self.logger.info("Discovered NSE Indices:\n" + 
                "\n".join(f"{row['SEM_SMST_SECURITY_ID']}: {row['SEM_TRADING_SYMBOL']}" 
                          for _, row in index_df.iterrows()))
            
            # Convert to list of tuples (exchange, security_id, feed_type)
            return [
                (marketfeed.NSE, str(row['SEM_SMST_SECURITY_ID']), marketfeed.Full)
                for _, row in index_df.iterrows()
            ]
            
        except Exception as e:
            self.logger.error(f"Error fetching NSE index list: {str(e)}", exc_info=True)
            return []
    
    def start_feed(self):
        """Start the NSE index market feed"""
        if not self.instruments:
            self.logger.error("No NSE index instruments found")
            return
            
        self.logger.info(f"Starting NSE Index Feed for {len(self.instruments)} indices")
        
        try:
            data = marketfeed.DhanFeed(
                self.client_id,
                self.access_token,
                self.instruments,
                "v2"
            )
            
            self.logger.info("NSE Index WebSocket connected")
            
            while True:
                data.run_forever()
                response = data.get_data()
                if response:
                    # Enhance with additional index metadata
                    response.update({
                        'segment': 'INDEX',
                        'timestamp': datetime.now()
                    })
                    self.collection.insert_one(response)
                    
                    # Log index updates periodically
                    if response.get('sequence_number', 0) % 10 == 0:
                        self.logger.info(
                            f"Index Update: {response.get('trading_symbol', 'unknown')} "
                            f"| LTP: {response.get('ltp', 'N/A')} "
                            f"| Change: {response.get('net_change', 'N/A')}"
                        )
                        
        except Exception as e:
            self.logger.error(f"NSE Index Feed error: {str(e)}", exc_info=True)
            raise
        finally:
            if 'data' in locals():
                data.disconnect()
            self.logger.info("NSE Index Feed connection closed")