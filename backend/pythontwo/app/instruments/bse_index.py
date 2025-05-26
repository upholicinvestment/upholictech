import os
import json
import warnings
from datetime import datetime

import pandas as pd
from pymongo import MongoClient
from dhanhq import marketfeed  # Make sure dhanhq SDK is installed

warnings.filterwarnings('ignore', message='Columns.*have mixed types')


class DhanBSEIndexFeed:
    def __init__(self):
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA')
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        
        # Initialize MongoDB
        self.mongo_client = MongoClient(self.mongo_uri)
        self.db = self.mongo_client['Upholic']
        self.collection = self.db['bse_index']

        # WebSocket settings
        self.version = "v2"
        self.data_feed = None
        self.running = False

    def fetch_index_instruments(self):
        url = "https://images.dhan.co/api-data/api-scrip-master.csv"
        try:
            dtype = {
                'SEM_EXM_EXCH_ID': str,
                'SEM_SEGMENT': str,
                'SEM_SMST_SECURITY_ID': str,
                'SEM_INSTRUMENT_NAME': str,
                'SEM_TRADING_SYMBOL': str
            }
            df = pd.read_csv(url, dtype=dtype, low_memory=False)

            index_df = df[
                (df['SEM_EXM_EXCH_ID'] == 'BSE') &
                (df['SEM_SEGMENT'] == 'I') &
                (df['SEM_INSTRUMENT_NAME'] == 'INDEX')
            ].copy()

            print(f"Found {len(index_df)} BSE indices.")

            if index_df.empty:
                print("No BSE indices found.")
                return None

            columns_map = {
                'SEM_EXM_EXCH_ID': 'exchange',
                'SEM_INSTRUMENT_NAME': 'instrument_type',
                'SEM_SMST_SECURITY_ID': 'security_id',
                'SEM_TRADING_SYMBOL': 'trading_symbol',
            }

            index_df = index_df[list(columns_map.keys())].rename(columns=columns_map)
            return index_df

        except Exception as e:
            print(f"Error fetching index list: {e}")
            return None

    def display_instrument_summary(self, df):
        if df is None or df.empty:
            print("No indices to display.")
            return

        print(f"\nTotal indices fetched: {len(df)}")
        print("\nInstrument Type Distribution:")
        print(df['instrument_type'].value_counts())
        print("\nINDEX Instruments:")
        print(df[['trading_symbol', 'security_id']].to_string(index=False))

    def prepare_subscriptions(self, df):
        if df is None or df.empty:
            print("No indices found, using default fallback.")
            return [
                (marketfeed.BSE, "2", marketfeed.Full),   # Default BSEDSI
                (marketfeed.BSE, "69", marketfeed.Full),  # BANKEX
            ]

        subscriptions = []
        for _, row in df.iterrows():
            security_id = str(row['security_id'])
            subscriptions.append((marketfeed.BSE, security_id, marketfeed.Full))
            print(f"Subscribed to: {row['trading_symbol']} (ID: {security_id})")

        return subscriptions

    def on_message(self, ws, message):
        try:
            data = json.loads(message) if isinstance(message, str) else message
            print(f"{datetime.now().strftime('%H:%M:%S')} - Data: {data}")
            self.save_to_db(data)
        except Exception as e:
            print(f"Error processing message: {e}")

    def save_to_db(self, data_dict):
        if not data_dict:
            return
        try:
            if isinstance(data_dict, dict):
                data_dict['received_at'] = datetime.utcnow()
                self.collection.insert_one(data_dict)
                print(f"Saved: {data_dict.get('security_id', 'unknown')}")
            else:
                print("Invalid data format.")
        except Exception as e:
            print(f"Error saving to DB: {e}")

    def on_error(self, ws, error):
        print(f"WebSocket error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        print(f"Closed WebSocket: {close_status_code} - {close_msg}")
        self.running = False

    def on_open(self, ws):
        print("WebSocket connection established.")
        self.running = True

    def run(self):
        print("Starting DhanHQ BSE Index Market Feed...\n")
        instruments_df = self.fetch_index_instruments()
        self.display_instrument_summary(instruments_df)
        subscriptions = self.prepare_subscriptions(instruments_df)
        print("\nSubscribing to:", subscriptions)

        try:
            self.data_feed = marketfeed.DhanFeed(
                self.client_id,
                self.access_token,
                subscriptions,
                self.version,
                on_open=self.on_open,
                on_message=self.on_message,
                on_error=self.on_error,
                on_close=self.on_close
            )
            print("Streaming live data... Press Ctrl+C to stop.\n")
            self.data_feed.run_forever()
        except KeyboardInterrupt:
            print("Terminated by user.")
        except Exception as e:
            print(f"Unexpected error: {e}")
        finally:
            self.running = False
            if self.data_feed:
                try:
                    self.data_feed.close_connection()
                except Exception as e:
                    print(f"Error closing connection: {e}")
            print("WebSocket closed.")


if __name__ == "__main__":
    feed = DhanBSEIndexFeed()
    feed.run()
