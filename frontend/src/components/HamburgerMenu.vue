<template>
    <div
        class="hamburgerMenu"
        :class="{
            hamburgerMenuClosed: !hamburgerOpen,
            hamburgerMenuOpen: hamburgerOpen,
        }"
    >
        <!-- eslint-disable vue/no-v-html -->
        <div class="hamburgerIcon" @click="toggle" v-html="hamburgerIcon" />
        <transition name="fade">
            <div v-if="hamburgerOpen" class="flexbox hamburgerList">
                <router-link to="/" class="hamburgerListItem">
                    Homepage
                </router-link>
                <router-link v-if="loggedIn" to="/dashboard" class="hamburgerListItem">
                    Dashboard
                </router-link>
                <router-link v-if="loggedIn" to="/testQueueItems" class="hamburgerListItem">
                    Test Queue Items
                </router-link>
            </div>
        </transition>
    </div>
</template>

<script>
import hamburgerIcon from 'bootstrap-icons/icons/justify.svg';
import {MUTATION_TOGGLE_HAMBURGER} from '../vuex/constants';
import {mapState} from 'vuex';
export default {
    name: 'HamburgerMenu',
    data() {
        return {
            hamburgerIcon,
        };
    },
    computed: {
        ...mapState(['hamburgerOpen', 'loggedIn']),
    },
    methods: {
        toggle() {
            this.$store.commit(MUTATION_TOGGLE_HAMBURGER);
        },
    },
};
</script>
