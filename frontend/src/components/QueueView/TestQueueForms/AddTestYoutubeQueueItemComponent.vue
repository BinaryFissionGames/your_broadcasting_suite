<template>
    <div class="test-form flexbox">
        <TransparentLoadingOverlay v-if="busy" />
        <h3 class="test-form-header">Add Test YouTube Item:</h3>
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
            <label for="sharingUser" class="test-form-label">User Name:</label>
            <input id="sharingUser" v-model="sharingUser" placeholder="Sharing User" class="test-form-text-box" />
        </div>
        <div>
            <label for="videoIdOrUrl" class="test-form-label">Video URL:</label>
            <input id="videoIdOrUrl" v-model="videoIdOrUrl" placeholder="Sharing User" class="test-form-text-box" />
        </div>
        <div>
            <label for="startTimeS" class="test-form-label">Start Time(seconds):</label>
            <input id="startTimeS" v-model.number="startTimeS" type="number" min="0" class="test-form-number-box" />
        </div>
        <div>
            <label for="durationS" class="test-form-label">Duration (seconds, 0 for full video):</label>
            <input id="durationS" v-model.number="durationS" type="number" min="0" class="test-form-number-box" />
        </div>
        <button :disabled="!valid" @click="submit">
            Add to queue
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import TransparentLoadingOverlay from '../../TransparentLoadingOverlay';
import {addTestYoutubeRequest, getAllQueuesCached} from '../../../api/api';
import {mapState} from 'vuex';
import {DEFAULT_QUEUE_NAME} from 'twitch_broadcasting_suite_shared';

export default Vue.extend({
    name: 'AddTestYoutubeQueueItemComponent',
    components: {
        TransparentLoadingOverlay,
    },
    data() {
        return {
            selectedQueue: 0,
            sharingUser: '',
            videoIdOrUrl: '',
            startTimeS: 0,
            durationS: 0,
            busy: true, // Actively making a request
        };
    },
    computed: {
        valid() {
            return (
                this.selectedQueue !== undefined &&
                this.sharingUser &&
                this.videoIdOrUrl && // TODO: Validate Video ID
                this.startTimeS !== undefined &&
                this.durationS !== undefined &&
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
                await addTestYoutubeRequest(
                    this.selectedQueue,
                    this.sharingUser,
                    this.videoIdOrUrl,
                    this.startTimeS,
                    this.durationS <= 0 ? undefined : this.durationS
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
