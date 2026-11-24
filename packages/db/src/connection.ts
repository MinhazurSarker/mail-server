import mongoose, { type Connection } from "mongoose";
import { env } from "@cellsinbox/env";

let cachedConnection: Connection | null = null;
let activeTestDbName: string | null = null;

export interface DatabaseConnectionOptions {
  uri?: string;
  dbName?: string;
}

export async function connectToDatabase(
  options: DatabaseConnectionOptions | string = {},
): Promise<Connection> {
  const opts: DatabaseConnectionOptions =
    typeof options === "string" ? { uri: options } : options;

  let uri = opts.uri || env.MONGODB_URI;
  let dbName = opts.dbName || env.MONGODB_DB_NAME;

  // If dbName not explicitly provided in options or environment, extract from URI pathname if present
  if (!dbName && uri) {
    try {
      const parsed = new URL(uri.startsWith("mongodb") ? uri : `mongodb://${uri}`);
      if (parsed.pathname && parsed.pathname.length > 1) {
        dbName = parsed.pathname.replace(/^\//, "").split("?")[0];
      }
    } catch {
      // ignore URL parsing error
    }
  }

  dbName = dbName || "cellsinbox";

  if (cachedConnection && cachedConnection.readyState === 1) {
    if (cachedConnection.db?.databaseName === dbName) {
      return cachedConnection;
    }
    // Connected to a different database; disconnect first
    await mongoose.disconnect();
    cachedConnection = null;
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri, {
    dbName,
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedConnection = conn.connection;

  try {
    const col = conn.connection.collection("mailbox_states");
    const indexes = await col.indexes();
    const hasOldIndex = indexes.some((idx) => idx.name === "userId_1_messageId_1");
    if (hasOldIndex) {
      await col.dropIndex("userId_1_messageId_1");
      console.log("[DB] Dropped legacy index userId_1_messageId_1 on mailbox_states");
    }
  } catch {
    // Ignore if collection doesn't exist yet
  }

  return cachedConnection;
}

export async function disconnectDatabase(): Promise<void> {
  if (cachedConnection || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}

/**
 * Safe test database connector.
 * Strictly requires dbName starting with "cellsinbox_test_" to prevent
 * accidental connection to development or production databases.
 */
export async function connectToTestDatabase(
  dbName: string,
  uri?: string,
): Promise<Connection> {
  if (!dbName || !dbName.startsWith("cellsinbox_test_")) {
    throw new Error(
      `SECURITY ABORT: connectToTestDatabase requires a dbName starting with 'cellsinbox_test_'. Provided: '${dbName}'`,
    );
  }

  if (mongoose.connection.readyState !== 0) {
    if (mongoose.connection.db?.databaseName !== dbName) {
      await mongoose.disconnect();
      cachedConnection = null;
    } else if (cachedConnection && cachedConnection.readyState === 1) {
      return cachedConnection;
    }
  }

  const baseUri = process.env.TEST_MONGODB_URI || uri || "mongodb://127.0.0.1:27017";
  let cleanUri = baseUri;
  try {
    const parsed = new URL(baseUri.startsWith("mongodb") ? baseUri : `mongodb://${baseUri}`);
    parsed.pathname = "";
    cleanUri = parsed.toString();
  } catch {
    // ignore
  }

  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(cleanUri, {
    dbName,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  if (conn.connection.db?.databaseName !== dbName) {
    await mongoose.disconnect();
    cachedConnection = null;
    throw new Error(
      `DATABASE ISOLATION ERROR: Connected to '${conn.connection.db?.databaseName}' instead of test database '${dbName}'! Aborted.`,
    );
  }

  activeTestDbName = dbName;
  cachedConnection = conn.connection;
  return cachedConnection;
}

/**
 * Drops the test database if and only if its name starts with "cellsinbox_test_"
 * and matches the active database established by this run.
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const currentDb = mongoose.connection.db.databaseName;
    if (!currentDb.startsWith("cellsinbox_test_")) {
      throw new Error(
        `SECURITY ABORT: Refusing to drop database '${currentDb}'. Name does not start with 'cellsinbox_test_'.`,
      );
    }
    if (activeTestDbName && currentDb !== activeTestDbName) {
      throw new Error(
        `SECURITY ABORT: Database ownership mismatch. Expected '${activeTestDbName}', found '${currentDb}'.`,
      );
    }
    await mongoose.connection.db.dropDatabase();
    activeTestDbName = null;
  }
  await disconnectDatabase();
}
