exports.up = function (knex) {
    return knex.schema
        .table('Webhook', function (table) {
            table.dropColumn('id');
        })
        .then(() => {
            return knex.schema.table('Webhook', function (table) {
                table.string('id').primary();
            });
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('Webhook', function (table) {
            table.dropColumn('id');
        })
        .then(() => {
            return knex.schema.table('Webhook', function (table) {
                table.increments('id');
            });
        });
};
