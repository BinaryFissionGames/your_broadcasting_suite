<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test Raid Notification:</h3>
        <div>
            <label for="testBitsQueue" class="test-form-label">Queue:</label>
            <select
                v-for="queue in queues"
                id="testBitsQueue"
                :key="queue.queueId"
                v-model="selectedQueue"
                class="test-form-select"
            >
                <option :value="queue.queueId">{{ queue.queueName }}</option>
            </select>
        </div>
        <div>
            <label for="channel" class="test-form-label">Channel Name:</label>
            <input id="channel" v-model="channel" placeholder="Channel Name" class="test-form-text-box" />
        </div>
        <div>
            <label for="viewers" class="test-form-label">Viewers:</label>
            <input id="viewers" v-model.number="viewers" type="number" min="1" class="test-form-number-box" />
        </div>
        <button :disabled="!valid" @click="submit">
            Add to queue
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import TransparentLoadingOverlay from '../../TransparentLoadingOverlay';
import {addTestSubscriberRequest, getAllQueuesCached} from '../../../api/api';
import {mapState} from 'vuex';
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared';

export default Vue.extend({
    name: 'AddTestRaidQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            channel: '',
            viewers: 1,
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return this.selectedQueue !== undefined && this.channel && this.viewers !== undefined && !this.busy;
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
                await addTestSubscriberRequest(this.selectedQueue, this.channel, this.viewers);
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
