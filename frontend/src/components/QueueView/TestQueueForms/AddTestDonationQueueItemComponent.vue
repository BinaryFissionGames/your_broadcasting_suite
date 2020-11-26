<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test Donation Notification:</h3>
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
            <label for="anonymous" class="test-form-label">Anonymous?:</label>
            <input id="anonymous" v-model="anonymous" class="test-form-check-box" type="checkbox" />
        </div>
        <div>
            <label for="donatingUser" class="test-form-label">Donating User:</label>
            <input id="donatingUser" v-model="donatingUser" placeholder="User Name" class="test-form-text-box" />
        </div>
        <div>
            <label for="amountUSCent" class="test-form-label">Amount(US Cents):</label>
            <input id="amountUSCent" v-model.number="amountUSCent" type="number" min="1" class="test-form-number-box" />
        </div>
        <div>
            <label for="donationMessage" class="test-form-label">Message:</label>
            <textarea id="donationMessage" v-model="message" class="test-form-text-area" />
        </div>
        <button :disabled="!valid" @click="submit">
            Add to queue
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import TransparentLoadingOverlay from '../../TransparentLoadingOverlay';
import {addTestDonationRequest, getAllQueuesCached} from '../../../api/api';
import {mapState} from 'vuex';
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared';

export default Vue.extend({
    name: 'AddTestDonationQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            anonymous: false,
            donatingUser: '',
            amountUSCent: 1,
            message: '',
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return (
                this.selectedQueue !== undefined &&
                this.anonymous !== undefined &&
                this.donatingUser &&
                this.amountUSCent !== undefined &&
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
                await addTestDonationRequest(
                    this.selectedQueue,
                    this.anonymous,
                    this.donatingUser,
                    this.amountUSCent,
                    this.message
                );
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
