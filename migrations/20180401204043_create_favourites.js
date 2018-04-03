exports.up = function(knex, Promise) {
    return knex.schema.createTable('favourites', function(table){
        table.increments();
        table.integer("who");
        table.integer('recruiter_id').references('users.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('favourites');
};
