import os
import warnings
from datetime import datetime
import pandas as pd
from pymongo import MongoClient
from dhanhq import marketfeed

# Suppress warnings
warnings.filterwarnings('ignore', message='Columns.*have mixed types')

class NSEFNOFeed:
    def __init__(self):
        # Load config from environment
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUxNDI5ODc3LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.Sw-V7-Qy-abQE4q83kz0PxUpHXjuwed_uvGP1LpTovMMYKWvbPD7C2HdJmn0HMjDtNNaIGjdQuLNWbg7deI_1w')
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        self.mongo_client = MongoClient(self.mongo_uri)
        self.db = self.mongo_client['Upholic']
        self.collection = self.db['nse_fno']

        self.version = "v2"
        self.data = None

    def fetch_fno_instruments(self):
        """Fetch NSE F&O instruments from Dhan master CSV."""
        url = "https://images.dhan.co/api-data/api-scrip-master.csv"
        try:
            dtype = {
                'SEM_SMST_SECURITY_ID': str,
                'SEM_EXPIRY_CODE': str,
                'SEM_STRIKE_PRICE': str,
                'SEM_TICK_SIZE': str,
                'SEM_INSTRUMENT_NAME': str,
                'SEM_EXM_EXCH_ID': str
            }
            df = pd.read_csv(url, dtype=dtype, low_memory=False)

            fno_df = df[
                (df['SEM_EXM_EXCH_ID'] == 'NSE') &
                (df['SEM_INSTRUMENT_NAME'].isin(['FUTSTK', 'OPTSTK']))
            ].copy()

            if fno_df.empty:
                print("No instruments found in NSE FNO master file.")
                return None

            columns_map = {
                'SEM_EXM_EXCH_ID': 'exchange',
                'SEM_INSTRUMENT_NAME': 'instrument_type',
                'SEM_SMST_SECURITY_ID': 'security_id',
                'SEM_TRADING_SYMBOL': 'trading_symbol',
                'SEM_CUSTOM_SYMBOL': 'custom_symbol',
                'SEM_EXPIRY_DATE': 'expiry_date',
                'SEM_STRIKE_PRICE': 'strike_price',
                'SEM_OPTION_TYPE': 'option_type',
                'SEM_TICK_SIZE': 'tick_size',
                'SEM_LOT_UNITS': 'lot_size',
                'SM_SYMBOL_NAME': 'symbol_name'
            }
            available_columns = [col for col in columns_map.keys() if col in fno_df.columns]
            fno_df = fno_df[available_columns].rename(columns=columns_map)

            # Clean and convert types
            if 'strike_price' in fno_df.columns:
                fno_df['strike_price'] = pd.to_numeric(fno_df['strike_price'], errors='coerce')
            if 'lot_size' in fno_df.columns:
                fno_df['lot_size'] = pd.to_numeric(fno_df['lot_size'], errors='coerce')
            if 'expiry_date' in fno_df.columns:
                fno_df['expiry_date'] = pd.to_datetime(fno_df['expiry_date'], errors='coerce')

            return fno_df

        except Exception as e:
            print(f"Error fetching instrument list: {e}")
            return None

    def display_instrument_summary(self, df):
        if df is None or df.empty:
            print("No instruments to display.")
            return

        print(f"\nTotal instruments fetched: {len(df)}")
        print("\nInstrument Type Distribution:")
        print(df['instrument_type'].value_counts())

        for inst_type in ['FUTSTK', 'OPTSTK']:
            if inst_type in df['instrument_type'].values:
                print(f"\n{inst_type} Instruments:")
                subset = df[df['instrument_type'] == inst_type]
                cols = ['trading_symbol', 'expiry_date', 'strike_price', 'option_type', 'lot_size']
                cols = [c for c in cols if c in subset.columns]
                print(subset[cols].to_string(index=False))

    def prepare_subscriptions(self, df):
        """Prepare list of instruments to subscribe for market feed."""
        if df is None or df.empty:
            # Fallback to default instruments
            print("No instruments found, using default fallback instruments.")
            return [
                (marketfeed.NSE_FNO, "57131", marketfeed.Full),  # NIFTY FUT
                (marketfeed.NSE_FNO, "57132", marketfeed.Full)   # BANKNIFTY FUT
            ]

        subscriptions = []
        for _, row in df.iterrows():
            security_id = row['security_id']
            subscriptions.append((marketfeed.NSE_FNO, security_id, marketfeed.Full))
            print(f"Subscribed to: {row.get('trading_symbol', 'N/A')} (Type: {row.get('instrument_type', 'N/A')}, ID: {security_id})")

        return subscriptions

    def save_to_db(self, data_dict):
        """Save market feed data to MongoDB."""
        if not data_dict:
            return
        try:
            # Insert a document, add a timestamp for traceability
            data_dict['received_at'] = datetime.utcnow()
            self.collection.insert_one(data_dict)
        except Exception as e:
            print(f"Error saving data to MongoDB: {e}")

    def run(self):
        print("Starting DhanHQ NSE F&O Market Feed...\n")
        instruments_df = self.fetch_fno_instruments()
        self.display_instrument_summary(instruments_df)
        subscriptions = self.prepare_subscriptions(instruments_df)

        try:
            print("\nConnecting to DhanHQ Market Feed WebSocket...")
            self.data = marketfeed.DhanFeed(self.client_id, self.access_token, subscriptions, self.version)
            print("Connected. Receiving market data... Press Ctrl+C to stop.\n")

            while True:
                self.data.run_forever()
                response = self.data.get_data()
                if response:
                    print(f"{datetime.now().strftime('%H:%M:%S')} - {response}")
                    self.save_to_db(response)

        except KeyboardInterrupt:
            print("\nDisconnected by user.")
        except Exception as e:
            print(f"\nAn error occurred: {e}")
        finally:
            if self.data:
                self.data.disconnect()
                print("WebSocket connection closed.")


if __name__ == "__main__":
    feed = NSEFNOFeed()
    feed.run()
