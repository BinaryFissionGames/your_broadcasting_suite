exports.up = function (knex) {
    return knex.schema
        .createTable('FollowsNotification', function (table) {
            table.increments('id');
            table.string('user').notNullable();
        })
        .createTable('SubscriberNotification', function (table) {
            table.increments('id');
            table.string('user').notNullable();
            table.integer('streak').notNullable();
            table.string('message').nullable();
        })
        .createTable('RaidNotification', function (table) {
            table.increments('id');
            table.string('channel').notNullable();
            table.integer('viewers').notNullable();
        })
        .createTable('YoutubeVideo', function (table) {
            table.increments('id');
            table.string('videoId').notNullable();
            table.integer('startTimeS').notNullable();
            table.integer('durationS').notNullable();
        })
        .createTable('BitsNotification', function (table) {
            table.increments('id');
            table.string('user').notNullable();
            table.integer('amount').notNullable();
            table.integer('message').nullable();
        })
        .createTable('DonationNotification', function (table) {
            table.increments('id');
            table.boolean('anonymous').notNullable();
            table.string('user').notNullable();
            table.string('message').nullable();
        })
        .table('QueueItem', function (table) {
            table.dropColumn('iconFile');
            table.dropColumn('extraData');
            table.integer('followsNotifId').unsigned().nullable().references('id').inTable('FollowsNotification');
            table.integer('subNotifId').unsigned().nullable().references('id').inTable('SubscriberNotification');
            table.integer('raidNotifId').unsigned().nullable().references('id').inTable('RaidNotification');
            table.integer('youtubeVideoId').unsigned().nullable().references('id').inTable('YoutubeVideo');
            table.integer('bitsNotifId').unsigned().nullable().references('id').inTable('BitsNotification');
            table.integer('donationNotifId').unsigned().nullable().references('id').inTable('DonationNotification');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('QueueItem', function (table) {
            table.dropForeign(['followsNotifId']);
            table.dropColumn('followsNotifId');
            table.dropForeign(['subNotifId']);
            table.dropColumn('subNotifId');
            table.dropForeign(['raidNotifId']);
            table.dropColumn('raidNotifId');
            table.dropForeign(['youtubeVideoId']);
            table.dropColumn('youtubeVideoId');
            table.dropForeign(['bitsNotifId']);
            table.dropColumn('bitsNotifId');
            table.dropForeign(['donationNotifId']);
            table.dropColumn('donationNotifId');
            table.json('extraData').nullable();
            table.string('iconFile').nullable();
        })
        .then(() => {
            return knex.schema
                .dropTable('FollowsNotification')
                .dropTable('SubscriberNotification')
                .dropTable('RaidNotification')
                .dropTable('YoutubeVideo')
                .dropTable('BitsNotification')
                .dropTable('DonationNotification');
        });
};
