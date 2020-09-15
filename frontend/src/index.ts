import Vue from 'vue';
import './index.html';
import Root from './components/Root.vue';
import Dashboard from './components/Dashboard.vue';
import LandingPage from './components/LandingPage.vue';
import TestQueuePage from './components/QueueView/TestQueuePage.vue';
import VueRouter from 'vue-router';
import './assets/scss/main.scss';
import Vuex from 'vuex';

import {redirectHomeIfLoggedOut} from './route_functions';
import {
    GETTER_LOADING,
    MUTATION_DECR_LOADING,
    MUTATION_INCR_LOADING,
    MUTATION_SET_LOGGED_IN,
    MUTATION_SET_QUEUES,
    MUTATION_TOGGLE_HAMBURGER,
} from './vuex/constants';
import {getOrSetLoggedIn} from './api/api';
import {State} from './vuex/types';
import {doWithMinTime} from './util/common';

console.log('Creating Vue instance...');
Vue.use(VueRouter);
Vue.use(Vuex);

const router = new VueRouter({
    routes: [
        {path: '/', component: LandingPage},
        {
            path: '/dashboard',
            component: Dashboard,
            beforeEnter: redirectHomeIfLoggedOut,
        },
        {
            path: '/testQueueItems',
            component: TestQueuePage,
            beforeEnter: redirectHomeIfLoggedOut,
        },
    ],
});

const store = new Vuex.Store({
    state: <State>{
        loadingCount: 1,
        loggedIn: false,
        hamburgerOpen: false,
        queues: null,
    },
    mutations: {
        [MUTATION_SET_LOGGED_IN](state, loggedIn: boolean) {
            state.loggedIn = loggedIn;
        },
        [MUTATION_INCR_LOADING](state) {
            state.loadingCount += 1;
        },
        [MUTATION_DECR_LOADING](state) {
            if (state.loadingCount > 0) {
                state.loadingCount -= 1;
            }
        },
        [MUTATION_TOGGLE_HAMBURGER](state) {
            state.hamburgerOpen = !state.hamburgerOpen;
        },
        [MUTATION_SET_QUEUES](state, queues) {
            state.queues = queues;
        },
    },
    getters: {
        [GETTER_LOADING](state): boolean {
            return state.loadingCount > 0;
        },
    },
});

new Vue({
    el: '#app',
    components: {
        Root,
    },
    template: '<Root></Root>',
    router,
    store,
});

console.log('Created Vue instance.');

async function load() {
    let loggedIn;
    try {
        loggedIn = await doWithMinTime(2000, getOrSetLoggedIn());
    } catch (e) {
        //TODO - better error handling
        console.log(e);
        return;
    }

    if (loggedIn && router.currentRoute.path !== '/dashboard') {
        await router.push('/dashboard');
    }

    store.commit(MUTATION_DECR_LOADING);
}

load().then(() => {
    console.log('Page loaded');
});

export {store};
