<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test Follower Notification:</h3>
        <div>
            <label for="testFollowerQueue" class="test-form-label">Queue:</label>
            <select
                v-for="queue in queues"
                id="testFollowerQueue"
                :key="queue.queueId"
                v-model="selectedQueue"
                class="test-form-select"
            >
                <option :value="queue.queueId">{{ queue.queueName }}</option>
            </select>
        </div>
        <div>
            <label for="followerName" class="test-form-label">Follower Name:</label>
            <input id="followerName" v-model="followerName" placeholder="Follower Name" class="test-form-text-box" />
        </div>
        <button :disabled="!valid" @click="submit">
            Add to queue
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import TransparentLoadingOverlay from '../../TransparentLoadingOverlay';
import {addTestFollowRequest, getAllQueuesCached} from '../../../api/api';
import {mapState} from 'vuex';
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared/dist';

export default Vue.extend({
    name: 'AddTestFollowQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            followerName: '',
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return this.selectedQueue !== undefined && this.followerName && !this.busy;
        },
        ...mapState(['queues']),
    },
    beforeMount() {
        getAllQueuesCached().then((queues) => {
            let defaultQueue = queues.find((queue) => {
                return queue.queueName === DEFAULT_QUEUE_NAME;
            });

            if (defaultQueue) {
                this.selectedQueue = defaultQueue.queueId;
            }

            this.busy = false;
        });
    },
    methods: {
        async submit() {
            this.busy = true;
            try {
                await addTestFollowRequest(this.selectedQueue, this.followerName);
            } catch (e) {
                //TODO: Error handling
                console.log(e);
            } finally {
                this.busy = false;
            }
        },
    },
});
</script>
