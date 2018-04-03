exports.up = function(knex, Promise) {
    return knex.schema.createTable('messages', function(table){
        table.increments();
        table.integer("from")
        table.integer("user_id").references('users.id');
        table.text('text');
        table.integer('seen');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('messages');
};