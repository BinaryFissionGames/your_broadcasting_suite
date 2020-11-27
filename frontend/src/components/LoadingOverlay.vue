<template>
    <transition name="fade">
        <div v-if="GETTER_LOADING" class="loading-overlay">
            <!-- eslint-disable vue/no-v-html -->
            <div class="loading-svg" v-html="loadingSvg" />
        </div>
    </transition>
</template>

<script>
import Vue from 'vue';
import loadingSvg from '../assets/svg/tail-spin.svg';
import {GETTER_LOADING} from '../vuex/constants';
import {mapGetters} from 'vuex';

export default Vue.extend({
    name: 'LoadingOverlay',
    data() {
        return {
            loadingSvg,
        };
    },
    computed: {
        ...mapGetters({
            GETTER_LOADING,
        }),
    },
});
</script>
