exports.up = function(knex, Promise) {
    return knex.schema.createTable('favourites', function(table){
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.uuid("who");
        table.uuid('recruiter_id').references('users.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('favourites');
};
