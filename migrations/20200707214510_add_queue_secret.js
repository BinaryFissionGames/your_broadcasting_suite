exports.up = function (knex) {
    return knex.schema.table('Queue', function (table) {
        table.string('secret', 20).notNullable().defaultTo('defaultsecret');
    });
};

exports.down = function (knex) {
    return knex.schema.table('Queue', function (table) {
        table.dropColumn('secret');
    });
};
