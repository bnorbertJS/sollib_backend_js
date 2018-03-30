exports.up = function(knex, Promise) {
    return knex.schema.createTable('solutions', function(table){
        table.increments();
        table.string('name').notNullable().unique();
        table.string('desc').notNullable();
        table.string('pic_url');
        table.integer('score');
        table.string('github');
        table.string('url');
        table.integer('user_id').references('users.id');
        table.timestamps();
      })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('solutions');
};
