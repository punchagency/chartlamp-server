import { Cluster } from "ioredis";
// import { redisOptions } from "./config";

const redis = new Cluster(
  [
    {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : 6379,
    },
  ],
  {
    slotsRefreshTimeout: 2000,
    // dnsLookup: This is needed when the addresses of startup nodes are hostnames instead of IPs.
    // dnsLookup: (address, callback) => callback(null, address),
    redisOptions: {
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
      tls: {},
    },
  }
);

redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("ready", () => console.log("🚀 Redis connection is ready"));
redis.on("error", (err: any) => console.error("❌ Redis error:", err));
redis.on("close", () => console.warn("⚠️ Redis connection closed"));
redis.on("reconnecting", () => console.log("♻️ Reconnecting to Redis..."));

export { redis };
