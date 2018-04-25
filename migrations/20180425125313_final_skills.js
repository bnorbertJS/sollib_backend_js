exports.up = function(knex, Promise) {
    return knex.schema.createTable('skills', function(table){
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string("name");
        table.uuid('user_id').references('users.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('skills');
};