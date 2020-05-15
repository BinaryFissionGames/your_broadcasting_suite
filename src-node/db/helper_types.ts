import {Sequelize, Model, DataTypes} from "sequelize";

type defineFunction = (sequelize: Sequelize, datatypes: typeof DataTypes) => Model;

type ModelExports = {
    init: defineFunction,
}

export {
    ModelExports
}