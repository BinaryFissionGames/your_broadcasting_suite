
exports.up = function(knex) {
  return knex.schema.table('Queue', function (table) {
        table.unique(["userId", "queueName"]);
  });
};

exports.down = function(knex) {
    return knex.schema.table('Queue', function (table) {
        table.dropForeign(['userId']);
        table.dropUnique(["userId", "queueName"]);
        table.foreign('userId').references('id').inTable('User');
    });
};
