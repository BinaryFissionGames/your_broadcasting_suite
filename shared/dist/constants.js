"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//API PATH CONSTANTS
exports.API_PATH_PREFIX = '/api';
exports.API_PATH_VERIFY_LOGGED_IN = '/auth/verifyLoggedIn';
exports.API_PATH_VERIFY_LOGGED_IN_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_VERIFY_LOGGED_IN;
exports.API_PATH_LOG_OUT = '/auth/logout';
exports.API_PATH_LOG_OUT_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_LOG_OUT;
exports.API_PATH_CURRENT_USER_PREFIX = '/current_user';
exports.API_PATH_GET_QUEUES = '/queues';
exports.API_PATH_GET_QUEUES_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_GET_QUEUES;
exports.API_PATH_GET_QUEUE_ITEMS = '/queue/all';
exports.API_PATH_GET_QUEUE_ITEMS_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_GET_QUEUE_ITEMS;
exports.API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM = '/queue/test/add/follow';
exports.API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM;
exports.API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM = '/queue/test/add/subscribe';
exports.API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM;
exports.API_PATH_ADD_TEST_BITS_QUEUE_ITEM = '/queue/test/add/bits';
exports.API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_BITS_QUEUE_ITEM;
exports.API_PATH_ADD_TEST_RAID_QUEUE_ITEM = '/queue/test/add/raid';
exports.API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_RAID_QUEUE_ITEM;
exports.API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM = '/queue/test/add/youtube';
exports.API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM;
exports.API_PATH_ADD_TEST_DONATION_QUEUE_ITEM = '/queue/test/add/donation';
exports.API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH = exports.API_PATH_PREFIX + exports.API_PATH_CURRENT_USER_PREFIX + exports.API_PATH_ADD_TEST_DONATION_QUEUE_ITEM;
//Queue constants:
exports.DEFAULT_QUEUE_NAME = 'Default';
//Websocket constants:
exports.WEBSOCKET_ALERTS_PATH = '/alerts';
exports.WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER = 'queue';
exports.WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER = 'secret';
