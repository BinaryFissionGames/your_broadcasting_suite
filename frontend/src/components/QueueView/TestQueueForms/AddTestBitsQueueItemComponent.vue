<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test Bits Notification:</h3>
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
            <label for="userName" class="test-form-label">User Name:</label>
            <input id="userName" v-model="userName" placeholder="User Name" class="test-form-text-box" />
        </div>
        <div>
            <label for="amount" class="test-form-label">Streak:</label>
            <input id="amount" v-model.number="amount" type="number" min="1" class="test-form-number-box" />
        </div>
        <div>
            <label for="bitsMessage" class="test-form-label">Message:</label>
            <textarea id="bitsMessage" v-model="message" class="test-form-text-area" />
        </div>
        <button :disabled="!valid" @click="submit">
            Add to queue
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import TransparentLoadingOverlay from '../../TransparentLoadingOverlay';
import {addTestBitsRequest, getAllQueuesCached} from '../../../api/api';
import {mapState} from 'vuex';
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared/dist';

export default Vue.extend({
    name: 'AddTestBitsQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            userName: '',
            amount: 1,
            message: '',
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return (
                this.selectedQueue !== undefined &&
                this.userName &&
                this.amount !== undefined &&
                this.message !== undefined &&
                !this.busy
            );
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
                await addTestBitsRequest(this.selectedQueue, this.userName, this.amount, this.message);
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
