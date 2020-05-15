import {Sequelize, DataTypes, Model} from "sequelize";
import {Token} from "./token";

class User extends Model {
  public id!: string;
  public twitchUserName!: string;
  public twitchId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

function init(sequelize: Sequelize, dataTypes: typeof DataTypes) : new() => Model {
  User.init({
    id: {type: dataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
    twitchUserName: {type: dataTypes.STRING, allowNull: false},
    twitchId: {type: dataTypes.STRING, allowNull: false, unique: true},
  }, {sequelize, tableName: 'Users', modelName: 'user'});

  return User;
}

export {
  init,
  User
}
