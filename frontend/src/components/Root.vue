<template>
    <div>
        <LoadingOverlay />
        <div class="page">
            <Navbar />
            <HamburgerMenu />
            <div
                class="mainDisplayArea"
                :class="{
                    mainDisplayAreaHamburgerClosed: !hamburgerOpen,
                    mainDisplayAreaHamburgerOpn: hamburgerOpen,
                }"
            >
                <transition name="fade-ethereal">
                    <router-view />
                </transition>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Navbar from './Navbar.vue';
import LoadingOverlay from './LoadingOverlay.vue';
import HamburgerMenu from './HamburgerMenu.vue';
import {mapState} from 'vuex';

export default Vue.extend({
    name: 'Root',
    components: {
        HamburgerMenu,
        Navbar,
        LoadingOverlay,
    },
    computed: {
        ...mapState(['hamburgerOpen']),
    },
});
</script>
