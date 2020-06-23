exports.up = function (knex) {
    return knex.schema.createTable('Queue', function (table) {
        table.increments('id');
        table.string('queueName', 255).notNullable();
        table.integer('userId').unsigned().references('id').inTable('User').notNullable();
        table.dateTime('createdAt').defaultTo(knex.raw('NOW()')).notNullable();
    }).createTable('QueueItem', function (table) {
        table.increments('id');
        table.integer('queueId').unsigned().references('id').inTable('Queue').notNullable();
        table.integer('type').notNullable();
        table.string('description', 255).notNullable();
        table.boolean('done').notNullable();
        table.string('iconUrl').nullable();
        table.string('iconFile').nullable();
        table.integer('estimatedDurationMs').nullable();
        table.json('extraData').nullable();
        table.dateTime('createdAt').defaultTo(knex.raw('NOW()')).notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('QueueItem').dropTable('Queue');
};
