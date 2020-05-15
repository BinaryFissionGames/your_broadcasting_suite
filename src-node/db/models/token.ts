import {DataTypes, Model, Sequelize} from "sequelize";
import {User} from "./user";

class Token extends Model {
    public id!: number;
    public userId: number;
    public oAuthToken!: string;
    public refreshToken: string;
    public tokenExpiry: Date;
    public scopes: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    get scopesArray() : string[] {
        let scopes = (<string>this.getDataValue('scopes'));
        if(scopes === ''){
            return []
        }
        return scopes.split(' ');
    }

    set scopesArray(val: string[]) {
        this.setDataValue('scopes', val.join(' '));
    }
}

function init(sequelize: Sequelize, dataTypes: typeof DataTypes) : new() => Model {
    Token.init({
        id: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true},
        oAuthToken: {type: DataTypes.STRING, unique: true, allowNull: false},
        refreshToken: {type: DataTypes.STRING},
        tokenExpiry: {type: DataTypes.DATE},
        scopes: { type: DataTypes.STRING } // Space-seperated scopes the token has
    }, {sequelize, tableName: 'Tokens', modelName: 'token'});


    Token.belongsTo(User, {targetKey: 'id'});

    return Token;
}

export {
    init,
    Token
}