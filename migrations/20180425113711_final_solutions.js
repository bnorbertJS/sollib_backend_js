exports.up = function(knex, Promise) {
    return knex.schema.createTable('solutions', function(table){
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string('name').notNullable().unique();
        table.string('desc').notNullable();
        table.string('pic_url');
        table.integer('score');
        table.string('github');
        table.string('url');
        table.integer('reported').notNullable();
        table.uuid('user_id').references('users.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('solutions');
};
