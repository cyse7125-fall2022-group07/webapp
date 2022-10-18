module.exports = (sequelize, Sequelize) => {
    const user = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        firstname: {
            type: Sequelize.STRING
        },
        lastname: {
            type: Sequelize.STRING
        },
        middlename: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        }
        ,
        is_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        schema: 'todo',
        timestamps: false,
    });
    return user;
};