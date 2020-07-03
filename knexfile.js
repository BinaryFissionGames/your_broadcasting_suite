// Update with your config settings.

module.exports = {
    development: {
        client: 'mysql2',
        connection: process.env.DATABASE_URL,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    production: {
        client: 'mysql2',
        connection: {
            database: 'twitch_broadcasting_suite',
            user: '',
            password: '',
            hostname: '',
            port: 3306,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};
