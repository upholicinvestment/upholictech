import os
import warnings
from datetime import datetime, timedelta
import pandas as pd
from pymongo import MongoClient
from dhanhq import marketfeed

# Suppress warnings
warnings.filterwarnings('ignore', message='Columns.*have mixed types')

class BSEFNOINDEX:
    def __init__(self):
        self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
        self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUwMzk0OTQzLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjcyNzk1MyJ9.tZNT1IquegPKp8efsudUbw4Ng6mk0Rf6e_zjcE_5M842st1eaXt3maEs8Lx_EDePjyG1gkh0K7O5QpkZirLHTA')
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        self.mongo_client = MongoClient(self.mongo_uri)
        self.db = self.mongo_client['Upholic']
        self.collection = self.db['bse_fno_index']
        self.version = "v2"
        self.data = None
        self.received_security_ids = set()
        self.active_security_ids = set()
        self.security_id_to_name = {}
        self.instrument_map = {}  # ✅ Added: for storing instrument details
        self.last_print_time = datetime.now()
        self.last_received_time = {}

    def fetch_fno_instruments(self):
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
                (df['SEM_EXM_EXCH_ID'] == 'BSE') &
                (df['SEM_INSTRUMENT_NAME'].isin(['FUTIDX', 'OPTIDX']))
            ].copy()

            if fno_df.empty:
                print("No instruments found in BSE FNO master file.")
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

            if 'strike_price' in fno_df.columns:
                fno_df['strike_price'] = pd.to_numeric(fno_df['strike_price'], errors='coerce')
            if 'lot_size' in fno_df.columns:
                fno_df['lot_size'] = pd.to_numeric(fno_df['lot_size'], errors='coerce')
            if 'expiry_date' in fno_df.columns:
                fno_df['expiry_date'] = pd.to_datetime(fno_df['expiry_date'], errors='coerce')
            self.security_id_to_name = dict(zip(fno_df['security_id'], fno_df['trading_symbol']))

            # ✅ Added: populate instrument_map
            for _, row in fno_df.iterrows():
                self.instrument_map[str(row['security_id'])] = {
                    'strike_price': row.get('strike_price'),
                    'option_type': row.get('option_type'),
                    'trading_symbol': row.get('trading_symbol'),
                    'expiry_date': row.get('expiry_date').strftime('%Y-%m-%d') if pd.notnull(row.get('expiry_date')) else None
                }

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

        for inst_type in ['FUTIDX', 'OPTIDX']:
            if inst_type in df['instrument_type'].values:
                print(f"\n{inst_type} Instruments:")
                subset = df[df['instrument_type'] == inst_type]
                cols = ['trading_symbol', 'expiry_date', 'strike_price', 'option_type', 'lot_size']
                cols = [c for c in cols if c in subset.columns]
                print(subset[cols].to_string(index=False))

    def prepare_subscriptions(self, df):
        if df is None or df.empty:
            print("No instruments found, using default fallback instruments.")

            return [
                (marketfeed.BSE_FNO, "57131", marketfeed.Full),
                (marketfeed.BSE_FNO, "57132", marketfeed.Full)
            ]
        subscriptions = []

        for _, row in df.iterrows():
            security_id = row['security_id']
            subscriptions.append((marketfeed.BSE_FNO, security_id, marketfeed.Full))
            print(f"Subscribed to: {row.get('trading_symbol', 'N/A')} (Type: {row.get('instrument_type', 'N/A')}, ID: {security_id})")
        return subscriptions

    def update_active_securities(self):
        cutoff_time = datetime.now() - timedelta(seconds=60)
        self.active_security_ids = {
            sec_id for sec_id, last_time in self.last_received_time.items()
            if last_time >= cutoff_time
        }

    def save_to_db(self, data_dict):
        if not data_dict:
            return

        try:
            if 'security_id' in data_dict:
                if data_dict.get("type") not in ["Full Data"]:  # or use "OI Data" if only interested in OI
                    return
                security_id = str(data_dict['security_id'])
                current_time = datetime.now()

                self.received_security_ids.add(security_id)
                self.last_received_time[security_id] = current_time
                self.update_active_securities()

                if (current_time - self.last_print_time).total_seconds() > 30:
                    print(f"\n[Stats] Unique securities (total): {len(self.received_security_ids)}")
                    print(f"[Stats] Currently active securities: {len(self.active_security_ids)}")
                    print(f"[Stats] Latest security: {self.security_id_to_name.get(security_id, f'Unknown (ID: {security_id})')}")
                    self.last_print_time = current_time

                # ✅ Added: inject instrument details into data_dict
                if security_id in self.instrument_map:
                    data_dict.update(self.instrument_map[security_id])
            data_dict['timestamp'] = datetime.now()
            self.collection.insert_one(data_dict)

        except Exception as e:
            print(f"Error saving data to MongoDB: {e}")


    def run(self):
        print("Starting DhanHQ BSE F&O Market Feed...\n")
        instruments_df = self.fetch_fno_instruments()
        self.display_instrument_summary(instruments_df)
        subscriptions = self.prepare_subscriptions(instruments_df)

        try:
            print("\nConnecting to DhanHQ Market Feed WebSocket...")
            self.data = marketfeed.DhanFeed(self.client_id, self.access_token, subscriptions, self.version)
            print(f"Subscribed to {len(subscriptions)} instruments")
            print("Connected. Receiving market data... Press Ctrl+C to stop.\n")

            while True:
                self.data.run_forever()
                response = self.data.get_data()

                if response:
                    print(f"{datetime.now().strftime('%H:%M:%S')} - {response}")
                    self.save_to_db(response)

        except KeyboardInterrupt:
            self.update_active_securities()
            print("\n" + "=" * 50)

            if self.active_security_ids:
                print("\nActive Securities:")
                for sec_id in sorted(self.active_security_ids):
                    print(f"  - {self.security_id_to_name.get(sec_id, f'Unknown (ID: {sec_id})')}")
            print("\nDisconnected by user.")

        except Exception as e:
            print(f"\nAn error occurred: {e}")
            print(f"Total unique securities received before error: {len(self.received_security_ids)}")
            print(f"Active securities before error: {len(self.active_security_ids)}")

        finally:
            if self.data:
                self.data.disconnect()
            print("WebSocket connection closed.")
            print("Connection Summary:")
            print(f"Total unique securities received: {len(self.received_security_ids)}")
            print(f"Currently active securities (received in last 60s): {len(self.active_security_ids)}")

if __name__ == "__main__":
    feed = BSEFNOINDEX()
    feed.run()