exports.up = function (knex) {
    return knex.schema
        .createTable('User', function (table) {
            table.increments('id');
            table.string('twitchUserName').notNullable();
            table.string('twitchId').unique().notNullable();
            table.dateTime('createdAt').defaultTo(knex.raw('NOW()')).notNullable();
        })
        .createTable('Token', function (table) {
            table.increments('id');
            table.integer('ownerId', 10).unsigned().references('id').inTable('User').onDelete('CASCADE');
            table.string('oAuthToken', 255).unique().notNullable();
            table.string('refreshToken');
            table.dateTime('tokenExpiry').notNullable();
            table.string('scopes').notNullable();
            table.dateTime('createdAt').defaultTo(knex.raw('NOW()'));
        })
        .createTable('Webhook', function (table) {
            table.increments('id');
            table.integer('type').notNullable();
            table.integer('ownerId', 10).unsigned().references('id').inTable('User');
            table.string('href').notNullable();
            table.boolean('subscribed').notNullable();
            table.dateTime('subscriptionStart');
            table.dateTime('subscriptionEnd');
            table.string('secret');
            table.integer('leaseSeconds');
            table.dateTime('createdAt').defaultTo(knex.raw('NOW()'));
        });
};

exports.down = function (knex) {
    return knex.schema.dropTable('Webhook').dropTable('Token').dropTable('User');
};
