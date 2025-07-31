/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.string('id').primary();
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.timestamp('startDate').notNullable();
    table.timestamp('endDate').notNullable();
    table.string('location', 200).nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    
    // Add indexes for common queries
    table.index(['startDate', 'endDate']);
    table.index('title');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('events');
};
