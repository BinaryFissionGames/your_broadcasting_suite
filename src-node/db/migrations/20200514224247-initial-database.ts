'use strict';

import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('Users', {
        id: {
          type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true
        },
        twitchUserName: {
          type: DataTypes.STRING, allowNull: false
        },
        twitchId: {
          type: DataTypes.STRING, allowNull: false, unique: true
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE
        }
      }, {transaction: t});

      await queryInterface.createTable('Tokens', {
        id: {
          type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED
        },
        oAuthToken: {
          type: DataTypes.STRING, unique: true, allowNull: false
        },
        refreshToken: {
          type: DataTypes.STRING
        },
        tokenExpiry: {
          type: DataTypes.DATE
        },
        scopes: {
          type: DataTypes.STRING,
        }
      }, {transaction: t});

      await queryInterface.addConstraint('Tokens', ['userId'], {
        type: 'foreign key',
        name: 'tokens_user_fk',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction: t
      });

      await queryInterface.createTable('Webhooks', {
        id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
        userId: {type: DataTypes.INTEGER.UNSIGNED},
        type: {type: DataTypes.INTEGER},
        href: {type: DataTypes.STRING},
        subscribed: {type: DataTypes.BOOLEAN},
        subscriptionStart: {type: DataTypes.DATE},
        subscriptionEnd: {type: DataTypes.DATE},
        secret: {type: DataTypes.STRING},
        leaseSeconds: {type: DataTypes.INTEGER}
      }, {transaction: t});

      await queryInterface.addConstraint('Webhooks', ['userId'], {
        type: 'foreign key',
        name: 'webhooks_user_fk',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction: t
      });

    });
  },

  down: (queryInterface: QueryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeConstraint('Webhooks', 'webhooks_user_fk', {transaction: t});
      await queryInterface.dropTable('Webhooks', {transaction: t});
      await queryInterface.removeConstraint('Tokens', 'tokens_user_fk', {transaction: t});
      await queryInterface.dropTable('Tokens', {transaction: t});
      await queryInterface.dropTable('Users', {transaction: t});
    });
  }
};
