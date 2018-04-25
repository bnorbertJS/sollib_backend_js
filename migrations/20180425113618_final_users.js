exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(table){
      table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
      table.string('username').notNullable().unique();
      table.string('lastname').notNullable();
      table.string('firstname').notNullable();
      table.string('profile_pic');
      table.string('github_url');
      table.string('linkedin_url');
      table.string('homepage_url');
      table.string('self_intro');
      table.string('level');
      table.string('role');
      table.string('experience');
      table.timestamp('last_login');
      table.boolean('isapproved');
      table.string('email').notNullable().unique();
      table.string('pass').notNullable();
      table.timestamps();
    })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
  };