import * as redis from 'redis';
import {RetryStrategyOptions} from 'redis';
import {logger} from '../logging';

const min_reconnect_time_s = 1;
const max_reconnect_time_s = 4;
const max_reconnect_time_num_attempts = Math.ceil(Math.log2(max_reconnect_time_s / min_reconnect_time_s));

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    retry_strategy(options: RetryStrategyOptions) {
        const retryLogger = logger.child({file: __filename, method: 'redisRetryStrategy'});
        // Always retry. But also log.
        retryLogger.error(
            `Redis is reconnecting. Attempt: ${options.attempt}, Total retry time: ${options.total_retry_time}, error: ` +
                JSON.stringify(options.error)
        );
        let reconnectTime;
        if (options.attempt > max_reconnect_time_num_attempts) {
            reconnectTime = max_reconnect_time_s * 1000;
        } else {
            reconnectTime =
                Math.min(max_reconnect_time_s, Math.pow(2, options.attempt - 1) * min_reconnect_time_s) * 1000;
        }

        return reconnectTime;
    },
});

//This client will be in "subscribe mode". This will be used for subscribe commands.
const pubSubRedisClient = redisClient.duplicate();

export default redisClient;
export {pubSubRedisClient};
