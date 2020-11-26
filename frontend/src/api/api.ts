import {store} from '../index';
import {MUTATION_SET_LOGGED_IN, MUTATION_SET_QUEUES} from '../vuex/constants';
import {getApiUrlWithPath} from '../util/url_utils';
import {
    AddBitsQueueItemRequest,
    AddDonationQueueItemRequest,
    AddFollowQueueItemRequest,
    AddRaidQueueItemRequest,
    AddSubscriptionQueueItemRequest,
    AddYoutubeQueueItemRequest,
    API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH,
    API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH,
    API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH,
    API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH,
    API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH,
    API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH,
    API_PATH_GET_QUEUES_FULL_PATH,
    API_PATH_LOG_OUT_FULL_PATH,
    API_PATH_VERIFY_LOGGED_IN_FULL_PATH,
    GenericResponse,
    isGetAllQueuesResponse,
    LogoutResponse,
    Queue,
    VerifyLoggedInResponse,
} from 'twitch_broadcasting_suite_shared';

export async function getOrSetLoggedIn(): Promise<boolean> {
    if (store.state.loggedIn) {
        return true;
    }

    const isLoggedIn = await getLoggedIn();

    store.commit(MUTATION_SET_LOGGED_IN, isLoggedIn);

    return isLoggedIn;
}

export async function getLoggedIn(): Promise<boolean> {
    const resp = await doApiRequestInternal('GET', API_PATH_VERIFY_LOGGED_IN_FULL_PATH);
    return (<VerifyLoggedInResponse>JSON.parse(resp)).loggedIn;
}

export async function logout(): Promise<LogoutResponse> {
    return <LogoutResponse>JSON.parse(await doApiRequestInternal('GET', API_PATH_LOG_OUT_FULL_PATH));
}

export async function addTestFollowRequest(queueId: number, followUser: string): Promise<void> {
    const requestObject: AddFollowQueueItemRequest = {
        queueId,
        followUser,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

export async function addTestSubscriberRequest(
    queueId: number,
    subscribingUser: string,
    streak: number,
    message?: string
): Promise<void> {
    const requestObject: AddSubscriptionQueueItemRequest = {
        queueId,
        subscribingUser,
        streak,
        subscriberMessage: message,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

export async function addTestBitsRequest(
    queueId: number,
    user: string,
    amount: number,
    message?: string
): Promise<void> {
    const requestObject: AddBitsQueueItemRequest = {
        queueId,
        user,
        amount,
        message,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

export async function addTestRaidRequest(queueId: number, raidUser: string, viewers: number): Promise<void> {
    const requestObject: AddRaidQueueItemRequest = {
        queueId,
        raidUser,
        viewerAmount: viewers,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

export async function addTestYoutubeRequest(
    queueId: number,
    sharingUser: string,
    videoId: string,
    startTime?: number,
    duration?: number
): Promise<void> {
    const requestObject: AddYoutubeQueueItemRequest = {
        queueId,
        sharingUser,
        videoIdOrUrl: videoId,
        startTimeS: startTime,
        durationS: duration,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

export async function addTestDonationRequest(
    queueId: number,
    anonymous: boolean,
    donatingUser: string,
    amountUSCent: number,
    message?: string
): Promise<void> {
    const requestObject: AddDonationQueueItemRequest = {
        queueId,
        anonymous,
        donatingUser,
        amountUSCent,
        message,
    };

    await doApiRequestInternal('POST', API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH, JSON.stringify(requestObject));
}

let getAllQueuesCachedPromise: Promise<Queue[]> | null = null;

export async function getAllQueuesCached(): Promise<Queue[]> {
    if (store.state.queues) {
        //Queues were fetched earlier; use cached copy
        return store.state.queues;
    }

    if (getAllQueuesCachedPromise) {
        //Indicates there is already a request in progress; Wait for that and grab it from the global store
        return getAllQueuesCachedPromise;
    }

    getAllQueuesCachedPromise = getAllQueues().then((queues) => {
        store.commit(MUTATION_SET_QUEUES, queues);
        return queues;
    });

    return getAllQueuesCachedPromise;
}

async function getAllQueues(): Promise<Queue[]> {
    const resp = await doApiRequestInternal('GET', API_PATH_GET_QUEUES_FULL_PATH);
    const respJson = JSON.parse(resp);
    if (isGetAllQueuesResponse(respJson)) {
        return respJson.queues;
    } else {
        throw new Error('Malformed response from getAllQueues.');
    }
}

async function doApiRequestInternal(method: 'GET' | 'POST', path: string, body?: string): Promise<string> {
    const fetchParams: RequestInit = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        body,
    };

    if (body) {
        fetchParams.headers = {
            'Content-Type': 'application/json',
        };
    }

    const resp = await fetch(getApiUrlWithPath(path), fetchParams);

    if (Math.floor(resp.status / 100) !== 2) {
        const response = <GenericResponse>JSON.parse(await resp.text());
        throw new Error(response.state.userFacingErrorMessage);
    }

    return resp.text();
}
