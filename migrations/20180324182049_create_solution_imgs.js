
exports.up = function(knex, Promise) {
    return knex.schema.createTable('solution_imgs', function(table){
        table.increments();
        table.string('url').notNullable().unique();
        table.integer('solution_id').references('solutions.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('solution_imgs');
};
