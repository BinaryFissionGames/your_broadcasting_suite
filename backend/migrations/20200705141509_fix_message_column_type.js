exports.up = function (knex) {
    return knex.schema
        .table('BitsNotification', function (table) {
            table.dropColumn('message');
        })
        .then(() => {
            return knex.schema.table('BitsNotification', function (table) {
                table.string('message').nullable();
            });
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('BitsNotification', function (table) {
            table.dropColumn('message');
        })
        .then(() => {
            return knex.schema.table('BitsNotification', function (table) {
                table.integer('message').nullable();
            });
        });
};
