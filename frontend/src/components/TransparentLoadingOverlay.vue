<template>
    <div class="transparent-loading-overlay">
        <!-- eslint-disable vue/no-v-html -->
        <div class="loading-svg-10-percent" v-html="loadingSvg" />
    </div>
</template>

<script>
import Vue from 'vue';
import loadingSvg from '../assets/svg/tail-spin.svg';

export default Vue.extend({
    name: 'TransparentLoadingOverlay',
    data() {
        return {
            loadingSvg,
        };
    },
});
</script>
