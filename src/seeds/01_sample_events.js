/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('events').del();
  
  // Insert sample events
  await knex('events').insert([
    {
      id: 'evt_sample_001',
      title: 'Team Meeting',
      description: 'Weekly team sync meeting to discuss project progress',
      startDate: new Date('2025-08-01T14:00:00Z'),
      endDate: new Date('2025-08-01T15:00:00Z'),
      location: 'Conference Room A',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'evt_sample_002',
      title: 'Client Presentation',
      description: 'Present the new calendar app features to the client',
      startDate: new Date('2025-08-02T10:00:00Z'),
      endDate: new Date('2025-08-02T11:30:00Z'),
      location: 'Main Conference Room',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'evt_sample_003',
      title: 'Code Review Session',
      description: 'Review the OpenAPI integration implementation',
      startDate: new Date('2025-08-03T16:00:00Z'),
      endDate: new Date('2025-08-03T17:00:00Z'),
      location: 'Development Office',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
};
