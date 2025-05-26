import pandas as pd
from dhanhq import marketfeed
import os
import warnings
from datetime import datetime, time, timedelta
import time as time_module
from pymongo import MongoClient
import pytz

class DhanClient:
    def __init__(self):
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA')
        self.mongo_client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
        self.db = self.mongo_client["Upholic"]
        self.collection = self.db["nse_equity"]
        self.total_stocks = 0
        self.stored_stocks = set()
        self.ist = pytz.timezone("Asia/Kolkata")
        self.market_start = time(9, 15)
        self.market_end = time(15, 30)
        self.collection_window = 60  # seconds per data collection run
        warnings.filterwarnings('ignore', message='Columns.*have mixed types')

    def get_current_ist_time(self):
        return datetime.now(self.ist).replace(tzinfo=None)

    def is_market_open(self):
        now = self.get_current_ist_time().time()
        return self.market_start <= now <= self.market_end

    def fetch_nse_equity_instruments(self):
        url = "https://images.dhan.co/api-data/api-scrip-master.csv"
        try:
            dtype = {
                'SEM_SMST_SECURITY_ID': str,
                'SEM_TICK_SIZE': str,
                'SEM_INSTRUMENT_NAME': str,
                'SEM_EXM_EXCH_ID': str,
                'SEM_SEGMENT': str,
                'SEM_EXCH_INSTRUMENT_TYPE': str
            }
            df = pd.read_csv(url, dtype=dtype, low_memory=False)
            nse_df = df[
                (df['SEM_EXM_EXCH_ID'] == 'NSE') &
                (df['SEM_SEGMENT'] == 'E') &
                (df['SEM_INSTRUMENT_NAME'] == 'EQUITY')
            ].copy()

            if nse_df.empty:
                print("No NSE equity instruments found.")
                return None

            columns_map = {
                'SEM_EXM_EXCH_ID': 'exchange',
                'SEM_INSTRUMENT_NAME': 'instrument_type',
                'SEM_SMST_SECURITY_ID': 'security_id',
                'SEM_TRADING_SYMBOL': 'trading_symbol',
                'SEM_CUSTOM_SYMBOL': 'custom_symbol',
                'SEM_TICK_SIZE': 'tick_size',
                'SM_SYMBOL_NAME': 'symbol_name',
                'SEM_SEGMENT': 'segment',
                'SEM_EXCH_INSTRUMENT_TYPE': 'exch_instrument_type'
            }

            available_columns = [col for col in columns_map if col in df.columns]
            return nse_df[available_columns].rename(columns=columns_map)

        except Exception as e:
            print(f"Error fetching nSE instrument list: {str(e)}")
            return None

    def count_nse_equity_stocks(self):
        df = self.fetch_nse_equity_instruments()
        if df is not None and not df.empty:
            self.total_stocks = len(df)
            print(f"\n✅ Total nSE Equity stocks: {self.total_stocks}\n")
            return self.total_stocks
        else:
            print("\n❌ No nSE Equity stocks found.\n")
            return 0

    def check_all_stocks_stored(self):
        if len(self.stored_stocks) >= self.total_stocks:
            print("\n🎉 All nSE stock data has been successfully stored in the database!\n")
            return True
        return False

    def run_data_collection_cycle(self):
        instruments_df = self.fetch_nse_equity_instruments()
        version = "v2"

        if instruments_df is None or instruments_df.empty:
            print("⚠️ Using fallback instruments (RELIANCE, HDFCBANK)")
            instruments = [
                (marketfeed.NSE, "3045", marketfeed.Full),
                (marketfeed.NSE, "1394", marketfeed.Full)
            ]
            self.total_stocks = 2
        else:
            instruments = []
            for _, row in instruments_df.iterrows():
                security_id = row['security_id']
                instruments.append((marketfeed.NSE, security_id, marketfeed.Full))
                print(f"📡 Subscribed: {row.get('trading_symbol', 'N/A')} ({security_id})")

        try:
            print("\n🔗 Connecting to WebSocket...")
            feed = marketfeed.DhanFeed(
                self.client_id,
                self.access_token,
                instruments,
                version
            )

            print("✅ Connected. Receiving data...\n")
            self.stored_stocks = set()
            start_time = time_module.time()

            while (time_module.time() - start_time) < self.collection_window:
                feed.run_forever()
                response = feed.get_data()
                if response:
                    security_id = str(response.get('security_id', ''))
                    if security_id and security_id not in self.stored_stocks:
                        self.stored_stocks.add(security_id)
                        response['timestamp'] = self.get_current_ist_time()
                        self.collection.insert_one(response)
                        current_time = self.get_current_ist_time().strftime('%H:%M:%S')
                        print(f"🕒 {current_time} IST - Stored data for security ID: {security_id} | Total stored: {len(self.stored_stocks)} / {self.total_stocks}")

                        if self.check_all_stocks_stored():
                            break

            print(f"\n📊 Unique stock records stored in this cycle: {len(self.stored_stocks)} / {self.total_stocks}")

        except Exception as e:
            print(f"\n❌ Error during data collection: {str(e)}")
        finally:
            if 'feed' in locals():
                feed.disconnect()
            print("🔒 Connection closed for this cycle.")

    def start_market_feed(self):
        print("🔌 Starting DhanHQ Market Data Collection System (nSE Equity)...\n")
        current_time = self.get_current_ist_time().strftime('%Y-%m-%d %H:%M:%S')
        print(f"⏰ Current System Time (IST): {current_time}")
        self.count_nse_equity_stocks()

        while True:
            current_ist = self.get_current_ist_time()

            if not self.is_market_open():
                if current_ist.time() < self.market_start:
                    next_run = datetime.combine(current_ist.date(), self.market_start)
                else:
                    next_run = datetime.combine(current_ist.date() + timedelta(days=1), self.market_start)

                wait_seconds = (next_run - current_ist).total_seconds()
                print(f"\n⏳ Market is closed. Next run at {next_run.strftime('%Y-%m-%d %H:%M:%S')} IST (in {wait_seconds / 60:.1f} minutes)")
                time_module.sleep(wait_seconds)
                continue

            print(f"\n🏁 Starting new data collection cycle at {current_ist.strftime('%H:%M:%S')} IST")
            self.run_data_collection_cycle()

            # Align cycles to minute boundary
            now = datetime.now()
            sleep_time = 60 - now.second
            time_module.sleep(sleep_time)

if __name__ == "__main__":
    client = DhanClient()
    client.start_market_feed()
