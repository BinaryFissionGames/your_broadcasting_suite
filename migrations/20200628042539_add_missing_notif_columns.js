exports.up = function (knex) {
    return knex.schema.table('YoutubeVideo', function (table) {
        table.string('sharingUser').notNullable();
    }).then(() => {
        return knex.schema.table('DonationNotification', function (table) {
            table.integer('amountUSCent').notNullable();
        });
    });
};

exports.down = function (knex) {
    return knex.schema.table('YoutubeVideo', function (table) {
        table.dropColumn('sharingUser');
    }).then(() => {
        return knex.schema.table('DonationNotification', function (table) {
            table.dropColumn('amountUSCent');
        });
    });
};
