// const redis  = require('redis');

// const redisClient  = redis.createClient({
//     host:'localhost',
//     port:6379
// });

// redisClient.on('connect', ()=>{console.log('redis connected successfully!')});
// redisClient.on('error', (err)=>{console.log('redis connection error!', err);
// })

// module.exports = {redisClient};

const redis = require('redis');

const redisClient = redis.createClient({
    socket: {
        host: 'localhost',
        port: 6379
    }
});

redisClient.on('connect', () => {
    console.log('Redis connected successfully!');
});

redisClient.on('error', (err) => {
    console.log('Redis connection error!', err);
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
})();

module.exports = { redisClient };
