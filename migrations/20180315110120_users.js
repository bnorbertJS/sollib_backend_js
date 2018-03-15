exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments();
    table.string('username').notNullable().unique();
    table.string('lastname').notNullable();
    table.string('firstname').notNullable();
    table.string('email').notNullable().unique();
    table.string('pass').notNullable();
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
