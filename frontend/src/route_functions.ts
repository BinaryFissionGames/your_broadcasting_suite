import {Route} from 'vue-router';
import {getOrSetLoggedIn} from './api/api';

async function redirectHomeIfLoggedOut(to: Route, from: Route, next: (n?: string) => void) {
    if (!(await getOrSetLoggedIn())) {
        return next('/');
    }
    return next();
}

export {redirectHomeIfLoggedOut};
