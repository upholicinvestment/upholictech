# dhan_client.py
import pandas as pd
from dhanhq import marketfeed
import os
import warnings
from datetime import datetime
from pymongo import MongoClient
import logging

class DhanClient:
    def __init__(self):
        self.logger = logging.getLogger('DhanClient')
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA')
        self.mongo_client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
        self.db = self.mongo_client['Upholic']
        self.collection = self.db['live_data']
        warnings.filterwarnings('ignore', message='Columns.*have mixed types')
        self.logger.info("DhanClient initialized")

    def fetch_fno_instruments(self):
        """Fetch all F&O and Equity instruments from Dhan's master CSV"""
        url = "https://images.dhan.co/api-data/api-scrip-master.csv"
        self.logger.info(f"Fetching instruments from: {url}")
        
        try:
            dtype = {
                'SEM_EXM_EXCH_ID': str,
                'SEM_SEGMENT': str,
                'SEM_SMST_SECURITY_ID': str,
                'SEM_INSTRUMENT_NAME': str,
                'SEM_EXPIRY_CODE': str,
                'SEM_TRADING_SYMBOL': str,
                'SEM_LOT_UNITS': str,
                'SEM_CUSTOM_SYMBOL': str,
                'SEM_EXPIRY_DATE': str,
                'SEM_STRIKE_PRICE': str,
                'SEM_OPTION_TYPE': str,
                'SEM_TICK_SIZE': str,
                'SEM_EXPIRY_FLAG': str,
                'SEM_EXCH_INSTRUMENT_TYPE': str,
                'SEM_SERIES': str,
                'SM_SYMBOL_NAME': str
            }
            
            self.logger.info("Downloading CSV data...")
            df = pd.read_csv(url, dtype=dtype, low_memory=False)
            self.logger.info(f"Raw data loaded. Shape: {df.shape}")
            
            # Filter for all relevant instruments
            fno_df = df[
                (df['SEM_EXM_EXCH_ID'].isin(['NSE', 'BSE'])) & 
                (df['SEM_INSTRUMENT_NAME'].isin([
                    'FUTIDX', 'FUTSTK', 'INDEX', 
                    'OPTFUT', 'OPTIDX', 'OPTSTK',
                    'EQUITY', 'FUTCUR', 'OPTCUR'
                ]))
            ].copy()
            
            # Enhanced printing of the DataFrame
            self.logger.info("\nNSE & BSE Instruments DataFrame:")
            print("\n" + "="*80)
            print("NSE & BSE Instruments DataFrame Preview:")
            print(fno_df.head())
            print("\nDataFrame Info:")
            print(fno_df.info())
            print("\nUnique Instrument Types:")
            print(fno_df['SEM_INSTRUMENT_NAME'].value_counts())
            print("\nUnique Exchanges:")
            print(fno_df['SEM_EXM_EXCH_ID'].value_counts())
            print("="*80 + "\n")
            
            if fno_df.empty:
                self.logger.warning("No instruments found matching criteria")
                return None
            
            columns_map = {
                'SEM_EXM_EXCH_ID': 'exchange',
                'SEM_SEGMENT': 'segment',
                'SEM_SMST_SECURITY_ID': 'security_id',
                'SEM_INSTRUMENT_NAME': 'instrument_type',
                'SEM_EXPIRY_CODE': 'expiry_code',
                'SEM_TRADING_SYMBOL': 'trading_symbol',
                'SEM_LOT_UNITS': 'lot_size',
                'SEM_CUSTOM_SYMBOL': 'custom_symbol',
                'SEM_EXPIRY_DATE': 'expiry_date',
                'SEM_STRIKE_PRICE': 'strike_price',
                'SEM_OPTION_TYPE': 'option_type',
                'SEM_TICK_SIZE': 'tick_size',
                'SEM_EXPIRY_FLAG': 'expiry_flag',
                'SEM_EXCH_INSTRUMENT_TYPE': 'exchange_instrument_type',
                'SEM_SERIES': 'series',
                'SM_SYMBOL_NAME': 'symbol_name'
            }
            
            available_columns = [col for col in columns_map.keys() if col in df.columns]
            self.logger.info(f"Returning {len(fno_df)} instruments")
            return fno_df[available_columns].rename(columns=columns_map)
            
        except Exception as e:
            self.logger.error(f"Error fetching instrument list: {str(e)}", exc_info=True)
            return None

    def start_market_feed(self):
        """Start the market data feed for ALL instruments (Full Data only)"""
        self.logger.info("Starting DhanHQ Market Feed for ALL instruments (Full Data only)")
        
        instruments_df = self.fetch_fno_instruments()
        version = "v2"
        
        if instruments_df is None or instruments_df.empty:
            self.logger.warning("Using default instruments as fallback")
            instruments = [
                (marketfeed.NSE_FNO, "57131", marketfeed.Full),  # NIFTY FUT
                (marketfeed.NSE_FNO, "57132", marketfeed.Full),  # BANKNIFTY FUT
                (marketfeed.BSE_FNO, "1", marketfeed.Full),     # Example BSE instrument
                (marketfeed.NSE, "3045", marketfeed.Full),
                (marketfeed.NSE, "1394", marketfeed.Full)
            ]
        else:
            instruments = []
            
            # Process all NSE instruments
            nse_df = instruments_df[instruments_df['exchange'] == 'NSE']
            for _, row in nse_df.iterrows():
                if row['instrument_type'] in ['FUTIDX', 'FUTSTK', 'OPTFUT', 'OPTIDX', 'OPTSTK']:
                    exchange = marketfeed.NSE_FNO
                elif row['instrument_type'] in ['EQUITY', 'INDEX', 'FUTCUR', 'OPTCUR']:
                    exchange = marketfeed.NSE
                else:
                    continue
                
                # Only subscribe to Full Data
                instruments.append((exchange, row['security_id'], marketfeed.Full))
                self.logger.debug(f"Subscribed to NSE (Full Data): {row['trading_symbol']} - {row['instrument_type']} (ID: {row['security_id']})")
            
            # Process all BSE instruments
            bse_df = instruments_df[instruments_df['exchange'] == 'BSE']
            for _, row in bse_df.iterrows():
                if row['instrument_type'] in ['FUTIDX', 'FUTSTK', 'OPTFUT', 'OPTIDX', 'OPTSTK']:
                    exchange = marketfeed.BSE_FNO
                elif row['instrument_type'] in ['EQUITY', 'INDEX', 'FUTCUR', 'OPTCUR']:
                    exchange = marketfeed.BSE
                else:
                    continue
                
                # Only subscribe to Full Data
                instruments.append((exchange, row['security_id'], marketfeed.Full))
                self.logger.debug(f"Subscribed to BSE (Full Data): {row['trading_symbol']} - {row['instrument_type']} (ID: {row['security_id']})")

        self.logger.info(f"Total instruments subscribed (Full Data only): {len(instruments)}")

        try:
            self.logger.info("Connecting to WebSocket...")
            data = marketfeed.DhanFeed(
                self.client_id, 
                self.access_token, 
                instruments, 
                version
            )
            
            self.logger.info("WebSocket connected. Receiving market data (Full Data only)...")
            
            while True:
                data.run_forever()
                response = data.get_data()
                if response:
                    # Ensure we only process Full Data
                    if response.get('type') == 'Full Data':
                        response['timestamp'] = datetime.now()
                        self.collection.insert_one(response)
                        self.logger.debug(f"Full Data stored for {response.get('exchange', 'unknown')}:{response.get('security_id', 'unknown')}")
                        print(response, 'response')
                    else:
                        self.logger.debug(f"Ignoring non-Full Data message: {response.get('type')}")

        except KeyboardInterrupt:
            self.logger.info("Disconnected by user")
        except Exception as e:
            self.logger.error(f"Error in market feed: {str(e)}", exc_info=True)
        finally:
            if 'data' in locals():
                data.disconnect()
            self.logger.info("Connection closed")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    client = DhanClient()
    client.start_market_feed()