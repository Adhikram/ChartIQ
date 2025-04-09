// Types matching your current schema
export interface Message {
  id: string;
  userId: string | null;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  createdAt: Date;
}

// Interface for our database service
export interface DbService {
  query: (text: string, params?: any[]) => Promise<any>;
  getPool: () => any;
}

// Create the database service
const createDbService = (): DbService => {
  // Ensure this only runs on the server side
  if (typeof window === 'undefined') {
    const { Pool } = require('pg');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (error: Error) => {
      console.error('Unexpected error on idle client', error);
      process.exit(-1);
    });

    return {
      query: async (text: string, params?: any[]) => {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('Executed query', { text, duration, rows: res.rowCount });
        }
        
        return res;
      },
      getPool: () => pool
    };
  }

  // Client-side implementation
  return {
    query: async () => {
      throw new Error('Database operations are not available on the client side');
    },
    getPool: () => {
      throw new Error('Database operations are not available on the client side');
    }
  };
};

// Export the database service instance
const dbService = createDbService();
export default dbService; 