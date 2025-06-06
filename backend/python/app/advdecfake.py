# import pandas as pd
# import os
# import warnings
# from datetime import datetime
# import time as time_module
# from pymongo import MongoClient
# import random
# from typing import Dict, List

# class DhanClient:
#     def __init__(self):
#         self.client_id = os.getenv('DHAN_CLIENT_ID', '1106727953')
#         self.access_token = os.getenv('DHAN_ACCESS_TOKEN', 'your-access-token')
#         self.mongo_client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
#         self.db = self.mongo_client['Upholic']
#         self.collection = self.db['advance_decline']
#         self.total_stocks = 0
#         self.stored_stocks = set()
#         warnings.filterwarnings('ignore', message='Columns.*have mixed types')

#         # For fake data generation
#         self.current_advances = random.randint(800, 1200)
#         self.current_declines = random.randint(800, 1200)
#         self.current_total = self.current_advances + self.current_declines

#     def generate_fake_depth(self) -> List[Dict]:
#         return [
#             {
#                 "buy": random.randint(100, 500),
#                 "sell": random.randint(100, 500),
#                 "price": round(random.uniform(50, 60), 2)
#             } for _ in range(5)
#         ]

#     def generate_fake_market_data(self, security_id: str) -> Dict:
#         now = datetime.utcnow()
#         ltp = round(random.uniform(50, 60), 2)

#         return {
#             "_id": f"{random.getrandbits(128):032x}",
#             "type": "Full Data",
#             "exchange_segment": 1,
#             "security_id": security_id,
#             "LTP": f"{ltp:.2f}",
#             "LTQ": random.randint(100, 200),
#             "LTT": now.strftime("%H:%M:%S"),
#             "avg_price": f"{ltp + random.uniform(-0.5, 0.5):.2f}",
#             "volume": random.randint(4000, 5000),
#             "total_sell_quantity": random.randint(4000, 6000),
#             "total_buy_quantity": random.randint(1000, 2000),
#             "OI": 0,
#             "oi_day_high": 0,
#             "oi_day_low": 0,
#             "open": f"{random.uniform(55, 58):.2f}",
#             "close": f"{random.uniform(57, 60):.2f}",
#             "high": f"{max(ltp, random.uniform(57, 59)):.2f}",
#             "low": f"{min(ltp, random.uniform(50, 56)):.2f}",
#             "depth": self.generate_fake_depth(),
#             "timestamp": now,
#             "advances": self.current_advances,
#             "declines": self.current_declines,
#             "total": self.current_total
#         }

#     def update_advance_decline(self):
#         change = random.randint(-50, 50)
#         self.current_advances = max(500, self.current_advances + change)
#         self.current_declines = max(500, self.current_declines - change)
#         self.current_total = self.current_advances + self.current_declines

#     def fetch_equity_instruments(self):
#         stocks = [
#             {"security_id": "3045", "trading_symbol": "RELIANCE"},
#             {"security_id": "1394", "trading_symbol": "HDFCBANK"},
#             {"security_id": "11536", "trading_symbol": "TCS"},
#             {"security_id": "1594", "trading_symbol": "INFY"},
#             {"security_id": "1660", "trading_symbol": "ICICIBANK"}
#         ]
#         return pd.DataFrame(stocks)

#     def count_nse_equity_stocks(self):
#         df = self.fetch_equity_instruments()
#         if df is not None and not df.empty:
#             self.total_stocks = len(df)
#             print(f"\n✅ Total NSE Equity stocks: {self.total_stocks}\n")
#             return self.total_stocks
#         else:
#             print("\n❌ No NSE Equity stocks found.\n")
#             return 0

#     def check_all_stocks_stored(self):
#         if len(self.stored_stocks) >= self.total_stocks:
#             print("\n🎉 All NSE stock data has been successfully stored in the database!\n")
#             return True
#         return False

#     def run_data_collection_cycle(self):
#         instruments_df = self.fetch_equity_instruments()

#         if instruments_df is None or instruments_df.empty:
#             print("⚠️ Using fallback instruments (RELIANCE, HDFCBANK)")
#             instruments_df = pd.DataFrame([
#                 {"security_id": "3045", "trading_symbol": "RELIANCE"},
#                 {"security_id": "1394", "trading_symbol": "HDFCBANK"}
#             ])
#             self.total_stocks = 2

#         try:
#             for _, row in instruments_df.iterrows():
#                 security_id = row['security_id']
#                 trading_symbol = row['trading_symbol']

#                 fake_data = self.generate_fake_market_data(security_id)
#                 self.collection.insert_one(fake_data)
#                 self.stored_stocks.add(security_id)

#                 print(f"🕒 {datetime.now().strftime('%H:%M:%S')} - "
#                       f"Stored fake data for {trading_symbol} ({security_id})")

#             self.update_advance_decline()

#         except Exception as e:
#             print(f"\n❌ Error during fake data generation: {str(e)}")

#     def start_market_feed(self):
#         print("🔌 Starting FAKE Market Data Collection System (Every Second)...\n")
#         self.count_nse_equity_stocks()

#         while True:
#             self.run_data_collection_cycle()
#             time_module.sleep(1)  # Collect every second

# if __name__ == "__main__":
#     client = DhanClient()
#     client.start_market_feed()
