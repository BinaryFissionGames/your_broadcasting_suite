import {Queue} from 'twitch_broadcasting_suite_shared/dist';

type State = {
    loggedIn: boolean;
    loadingCount: number;
    hamburgerOpen: boolean;
    queues: Queue[] | null;
};

export {State};
