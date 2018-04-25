exports.up = function(knex, Promise) {
    return knex.schema.createTable('messages', function(table){
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.uuid("from")
        table.uuid("user_id").references('users.id').onDelete('CASCADE').index();
        table.text('text');
        table.integer('seen');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('messages');
};