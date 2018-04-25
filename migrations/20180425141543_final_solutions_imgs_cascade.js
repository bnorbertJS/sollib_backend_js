
exports.up = function(knex, Promise) {
    return knex.schema.createTable('solution_imgs', function(table){
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string('url').notNullable().unique();
        table.uuid('solution_id').references('solutions.id').onDelete('CASCADE');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('solution_imgs');
};
