
exports.up = function(knex) {
    return knex.schema.table('QueueItem', function(table){
        table.dateTime('completionDate').nullable();
  });
};

exports.down = function(knex) {
    return knex.schema.table('QueueItem', function(table){
        table.dropColumn('completionDate');
    });
};
