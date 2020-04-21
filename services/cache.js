const mongoose = require("mongoose");
const redis = require("redis");
const utils = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = utils.promisify(client.hget).bind(client);
client.hset = utils.promisify(client.hset).bind(client);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function ({ key }) {
  this.useCache = true;
  this.hashKey = JSON.stringify(key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) return exec.apply(this, arguments);
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    const parsedCache = JSON.parse(cacheValue);
    return Array.isArray(parsedCache)
      ? parsedCache.map((item) => new this.model(item))
      : new this.model(parsedCache);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));
  return result;
};

const clearCache = (hashKey) => {
  return client.del(JSON.stringify(hashKey));
};

module.exports = {
  clearCache,
};
