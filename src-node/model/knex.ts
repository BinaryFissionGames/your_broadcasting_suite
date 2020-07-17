import * as Knex from 'knex';

let knex = Knex({
    client: 'mysql',
    connection: process.env.DATABASE_URL
});

export {
    knex
}