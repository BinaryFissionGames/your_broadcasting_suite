<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test Subscriber Notification:</h3>
        <div>
            <label for="testSubscriberQueue" class="test-form-label">Queue:</label>
            <select
                v-for="queue in queues"
                id="testSubscriberQueue"
                :key="queue.queueId"
                v-model="selectedQueue"
                class="test-form-select"
            >
                <option :value="queue.queueId">{{ queue.queueName }}</option>
            </select>
        </div>
        <div>
            <label for="subscriberName" class="test-form-label">Subscriber Name:</label>
            <input
                id="subscriberName"
                v-model="subscriberName"
                placeholder="Subscriber Name"
                class="test-form-text-box"
            />
        </div>
        <div>
            <label for="streak" class="test-form-label">Streak:</label>
            <input id="streak" v-model.number="streak" type="number" min="1" class="test-form-number-box" />
        </div>
        <div>
            <label for="subscribeMessage" class="test-form-label">Message:</label>
            <textarea id="subscribeMessage" v-model="message" class="test-form-text-area" />
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
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared/dist';

export default Vue.extend({
    name: 'AddTestSubscriberQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            subscriberName: '',
            streak: 1,
            message: '',
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return (
                this.selectedQueue !== undefined &&
                this.subscriberName &&
                this.streak !== undefined &&
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
                await addTestSubscriberRequest(this.selectedQueue, this.subscriberName, this.streak, this.message);
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
