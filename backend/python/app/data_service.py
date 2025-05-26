from pymongo import MongoClient
import os
from datetime import datetime

class DataService:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
        self.db = self.client['Upholic']
    
    def get_market_data(self, symbol=None, start_date=None, end_date=None):
        """Retrieve market data with optional filters"""
        collection = self.db['live_data']
        
        query = {}
        if symbol:
            query['symbol'] = symbol
        if start_date and end_date:
            query['timestamp'] = {
                '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
                '$lte': datetime.strptime(end_date, '%Y-%m-%d')
            }
        
        return list(collection.find(query).sort('timestamp', -1).limit(1000))