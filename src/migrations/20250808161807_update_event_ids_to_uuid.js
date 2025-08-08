const { v4: uuidv4 } = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Get all existing events with the old ID format (evt_*)
  const existingEvents = await knex('events').select('id').where('id', 'like', 'evt_%');
  
  // Update each event with a new UUID
  for (const event of existingEvents) {
    const newId = uuidv4();
    await knex('events')
      .where('id', event.id)
      .update({ id: newId });
  }
  
  console.log(`Updated ${existingEvents.length} event IDs to UUID format`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // This migration is not easily reversible since we can't restore the original IDs
  // In a real-world scenario, you might want to create a backup table first
  console.log('Warning: This migration cannot be easily reversed. Original IDs are lost.');
  return Promise.resolve();
};
