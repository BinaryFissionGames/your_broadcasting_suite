import * as Knex from 'knex';

const knex = Knex({
    client: 'mysql',
    connection: process.env.DATABASE_URL,
});

export {knex};
