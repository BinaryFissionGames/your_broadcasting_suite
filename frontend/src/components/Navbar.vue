<template>
    <div class="navbar flexbox">
        <p class="navbar-name">
            Your Broadcasting Suite
        </p>
        <div class="navbar-buttons">
            <a v-if="!loggedIn" :href="authUrl"><p class="navbar-login">Login</p></a>
            <a v-else href="#" @click.once="logout"><p class="navbar-login">Logout</p></a>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {mapState} from 'vuex';
import {getApiUrlWithPath} from '../util/url_utils';
import {MUTATION_DECR_LOADING, MUTATION_INCR_LOADING, MUTATION_SET_LOGGED_IN} from '../vuex/constants';
import {logout} from '../api/api';
import {doWithMinTime} from '../util/common';

export default Vue.extend({
    name: 'Navbar',
    computed: {
        authUrl() {
            return getApiUrlWithPath('/auth/login');
        },
        ...mapState(['loggedIn']),
    },
    methods: {
        async logout() {
            this.$store.commit(MUTATION_INCR_LOADING);
            await doWithMinTime(2000, logout());
            this.$store.commit(MUTATION_SET_LOGGED_IN, false);
            if (this.$router.currentRoute.path !== '/') {
                await this.$router.push('/');
            }
            this.$store.commit(MUTATION_DECR_LOADING);
        },
    },
});
</script>
