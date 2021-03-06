//API PATH CONSTANTS
export const API_PATH_PREFIX = '/api';

export const API_PATH_VERIFY_LOGGED_IN = '/auth/verifyLoggedIn';
export const API_PATH_VERIFY_LOGGED_IN_FULL_PATH = API_PATH_PREFIX + API_PATH_VERIFY_LOGGED_IN;

export const API_PATH_LOG_OUT = '/auth/logout';
export const API_PATH_LOG_OUT_FULL_PATH = API_PATH_PREFIX + API_PATH_LOG_OUT;

export const API_PATH_CURRENT_USER_PREFIX = '/current_user';
export const API_PATH_GET_QUEUES = '/queues';
export const API_PATH_GET_QUEUES_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_GET_QUEUES;
export const API_PATH_GET_QUEUE_ITEMS = '/queue/all';
export const API_PATH_GET_QUEUE_ITEMS_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_GET_QUEUE_ITEMS;
export const API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM = '/queue/test/add/follow';
export const API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM;
export const API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM = '/queue/test/add/subscribe';
export const API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM;
export const API_PATH_ADD_TEST_BITS_QUEUE_ITEM = '/queue/test/add/bits';
export const API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_BITS_QUEUE_ITEM;
export const API_PATH_ADD_TEST_RAID_QUEUE_ITEM = '/queue/test/add/raid';
export const API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_RAID_QUEUE_ITEM;
export const API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM = '/queue/test/add/youtube';
export const API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM;
export const API_PATH_ADD_TEST_DONATION_QUEUE_ITEM = '/queue/test/add/donation';
export const API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH = API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX + API_PATH_ADD_TEST_DONATION_QUEUE_ITEM;

//Queue constants:
export const DEFAULT_QUEUE_NAME = 'Default';

//Websocket constants:
export const WEBSOCKET_ALERTS_PATH = '/alerts';
export const WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER = 'queue';
export const WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER = 'secret';
