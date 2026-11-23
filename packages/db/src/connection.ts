import mongoose, { type Connection } from "mongoose";
import { env } from "@cellsinbox/env";

let cachedConnection: Connection | null = null;

export interface DatabaseConnectionOptions {
  uri?: string;
  dbName?: string;
}

export async function connectToDatabase(
  options: DatabaseConnectionOptions = {},
): Promise<Connection> {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  const uri = options.uri || env.MONGODB_URI;
  const dbName = options.dbName || env.MONGODB_DB_NAME;

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri, {
    dbName,
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedConnection = conn.connection;
  return cachedConnection;
}

export async function disconnectDatabase(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}
