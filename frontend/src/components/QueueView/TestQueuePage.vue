<template>
    <div class="test-form-wrapper flexbox-block flex-center-top-align flex-space-evenly">
        <AddTestFollowQueueItemComponent />
        <AddTestSubscriberQueueItemComponent />
        <AddTestBitsQueueItemComponent />
        <AddTestRaidQueueItemComponent />
        <AddTestYoutubeQueueItemComponent />
        <AddTestDonationQueueItemComponent />
    </div>
</template>

<script>
import Vue from 'vue';
import AddTestFollowQueueItemComponent from './TestQueueForms/AddTestFollowQueueItemComponent.vue';
import AddTestSubscriberQueueItemComponent from './TestQueueForms/AddTestSubscriberQueueItemComponent.vue';
import AddTestBitsQueueItemComponent from './TestQueueForms/AddTestBitsQueueItemComponent.vue';
import AddTestRaidQueueItemComponent from './TestQueueForms/AddTestRaidQueueItemComponent.vue';
import AddTestYoutubeQueueItemComponent from './TestQueueForms/AddTestYoutubeQueueItemComponent.vue';
import AddTestDonationQueueItemComponent from './TestQueueForms/AddTestDonationQueueItemComponent.vue';

export default Vue.extend({
    name: 'TestQueuePage',
    components: {
        AddTestFollowQueueItemComponent,
        AddTestSubscriberQueueItemComponent,
        AddTestBitsQueueItemComponent,
        AddTestRaidQueueItemComponent,
        AddTestYoutubeQueueItemComponent,
        AddTestDonationQueueItemComponent,
    },
});
</script>
