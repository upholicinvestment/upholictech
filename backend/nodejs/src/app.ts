import express, { Request, Response, NextFunction } from 'express';
import { MongoClient, Db } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
// const dayjs = require("dayjs");
require("dotenv").config();

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Setup MongoDB
let db: Db;
let mongoClient: MongoClient;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || !process.env.MONGO_DB_NAME) {
      console.error('Missing MongoDB configuration in .env');
      process.exit(1);
    }

    mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB_NAME);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Connect to DB before starting server
connectDB();



// Routes
app.use('/api', routes);

// ✅ API: Fetch selected stocks with LTP and volume
app.get('/api/stocks', async (_req, res) => {
  try {
    const securityIds = [
      3499, 4306, 10604, 1363, 13538, 11723, 5097, 25, 2475, 1594, 2031,
      16669, 1964, 11483, 1232, 7229, 2885, 16675, 11536, 10999, 18143, 3432,
      3506, 467, 910, 3787, 15083, 21808, 1660, 3045, 157, 881, 4963, 383, 317,
      11532, 11630, 3351, 14977, 1922, 5258, 5900, 17963, 1394, 1333, 1348, 694,
      236, 3456
    ];

    const stocks = await db.collection('nse_equity')
      .find({ security_id: { $in: securityIds } })
      .project({
        _id: 0,
        security_id: 1,
        LTP: 1,
        volume: 1,
        close: 1 // Include the close price (previous day's close)
      })
      .toArray();

    res.json(stocks);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});



app.get('/api/advdec', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) throw new Error('Database not connected');

    // Define the time range (last 60 minutes)
    const since = new Date(Date.now() - 60 * 60 * 1000);

    // Ensure an index on the 'timestamp' field for efficient sorting
    await db.collection('nse_fno_index').createIndex({ timestamp: 1 });

    // Fetch records from the last 60 minutes
    const records = await db.collection('nse_fno_index')
      .find({ timestamp: { $gte: since } }, { projection: { LTP: 1, close: 1, timestamp: 1 } })
      .sort({ timestamp: 1 })
      .toArray();

    if (!records.length) {
      res.status(404).json({ error: 'No data available' });
      return;
    }

    // Group records by time (HH:MM)
    const formatTime = (isoString: string) => {
      const d = new Date(isoString);
      const hours = d.getUTCHours().toString().padStart(2, '0');
      const minutes = d.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const grouped: Record<string, any[]> = {};
    for (const doc of records) {
      const time = formatTime(doc.timestamp);
      if (!grouped[time]) grouped[time] = [];
      grouped[time].push(doc);
    }

    // Calculate advances and declines for each time group
    const chartData = Object.entries(grouped).map(([time, group]) => {
      let advances = 0, declines = 0;
      for (const stock of group) {
        const ltp = parseFloat(stock.LTP);
        const close = parseFloat(stock.close);
        if (ltp > close) advances++;
        else if (ltp < close) declines++;
      }
      return { time, advances, declines };
    });

    const latest = chartData.at(-1);

    const current = {
      advances: latest?.advances ?? 0,
      declines: latest?.declines ?? 0,
      total: (latest?.advances ?? 0) + (latest?.declines ?? 0)
    };

    // Log the fetched data for debugging
    console.log('Last fetched data:', {
      current,
      chartData,
      latestRecordTime: records[records.length - 1]?.timestamp,
      totalRecords: records.length
    });

    res.json({ current, chartData });
  } catch (err) {
    console.error('Error in /api/advdec:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});




app.get('/api/heatmap', async (req, res) => {
  try {
    const collection = db.collection('nse_fno');

    // Hardcoded list of security_ids
    const securityIds = [
      56787, 56788, 56789, 56794, 56795, 56798, 56799, 56800, 56801, 56806,
      56807, 56808, 56809, 56810, 56811, 56816, 56817, 56818, 56819, 56822,
      56823, 56826, 56827, 56828, 56829, 56830, 56831, 56832, 56833, 56834,
      56835, 56838, 56839, 56844, 56845, 56846, 56847, 56848, 56849, 56850,
      56851, 56852, 56853, 56856, 56857, 56858, 56859, 56860, 56861, 56862,
      56863, 56864, 56865, 56900, 56901, 56904, 56905, 56906, 56907, 56908,
      56909, 56910, 56911, 56918, 56919, 56926, 56927, 56928, 56929, 56930,
      56931, 56932, 56933, 56940, 56941, 56946, 56947, 56952, 56953, 56954,
      56955, 56956, 56957, 56966, 56967, 56968, 56969, 56970, 56971, 56972,
      56973, 56986, 56987, 56988, 56989, 56990, 56991, 56994, 56995, 57002,
      57003, 57004, 57005, 57010, 57011, 57012, 57013, 57020, 57021, 57024,
      57025, 57026, 57027, 57032, 57033, 57034, 57035, 57038, 57039, 57042,
      57043, 57048, 57049, 57050, 57051, 57052, 57053, 57054, 57055, 57056,
      57057, 57058, 57059, 57060, 57061, 57062, 57063, 57064, 57065, 57066,
      57067, 57068, 57069, 57070, 57071, 57072, 57073, 57074, 57075, 57077,
      57079, 57080, 57081, 57082, 57083, 57084, 57085, 57086, 57087, 57088,
      57091, 57092, 57093, 57094, 57095, 57100, 57101, 57104, 57105, 57110,
      57111, 57112, 57113, 57114, 57115, 57120, 57121, 57122, 57123, 57128,
      57129, 57200, 57201, 57222, 57223, 57224, 57225, 57238, 57239, 57248,
      57249, 57250, 57251, 57252, 57253, 57254, 57255, 57256, 57257, 57258,
      57261, 57262, 57263, 57264, 57273, 57274, 57275, 57276, 57277, 57278,
      57283, 64224, 64232, 64411, 64623, 64898, 64906, 64987, 64996, 65236
    ];

    // Attempt to find matching documents using numeric security_id
    let items = await collection.find({ security_id: { $in: securityIds } })
      .sort({ _id: -1 })
      .limit(200)
      .toArray();

    // If none found, try converting security_ids to strings
    if (items.length === 0) {
      items = await collection.find({ security_id: { $in: securityIds.map(id => id.toString()) } })
        .sort({ _id: -1 })
        .limit(200)
        .toArray();
    }

    // Final fallback to get latest 50 records without filter
    let fallbackItems: any[] = [];
    if (items.length === 0) {
      console.log('No items found with security_id filter, trying fallback query...');
      fallbackItems = await collection.find({})
        .sort({ _id: -1 })
        .limit(50)
        .toArray();
    }

    const resultItems: any[] = items.length > 0 ? items : fallbackItems;

    // Add default sector if missing
    const processedItems = resultItems.map((item: any) => ({
      ...item,
      sector: item.sector || 'Unknown'
    }));

    // Log the processed data
    console.log(`\nSent ${processedItems.length} heatmap records`);
    console.log(JSON.stringify(processedItems.slice(0, 5), null, 2)); // Print first 5 records for preview

    // Send as response
    res.json(processedItems);
  } catch (error: any) {
    console.error('\nError fetching heatmap data:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});



// Error handling middleware (must be after routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (${socket.id}):`, reason);
  });

  socket.on('error', (err) => {   
    console.error('Socket error:', err);
  });
});

const PORT = Number(process.env.PORT) || 8000;
// const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT,
  // HOST,
  () => {
    // console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log(`🔗 Allowed CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });


// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoClient.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { io };