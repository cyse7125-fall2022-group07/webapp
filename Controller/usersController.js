const db = require('../config/sequelizeDB.js');
const User = db.users;
const bcrypt = require('bcrypt');
const {v4:uuidv4} = require('uuid');


// Create a User

async function createUser (req, res, next) {
    var hash = await bcrypt.hash(req.body.password, 10);
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if(!emailRegex.test(req.body.email)) {
        res.status(400).send({
            message: 'Enter your Email ID in correct format. Example: abc@xyz.com'
        });
    }
    const getUser = await User .findOne({where: {email: req.body.email}}).catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the user'
        });
    });
    if(getUser) {
        res.status(400).send({
            message: 'User already exists!'
        });

    } else {
        var user = {
            id: uuidv4(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: hash,
            email: req.body.email
        };
    
    User.create(user).then(data => {
        res.status(201).send({
            id: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            account_created: data.createdat,
            account_updated: data.updatedat
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the user!"
        });
    });
    }
}

//Get a User

async function getUser(req, res, next) {
    const user = await getUserByUsername(req.user.email);
    if (user) {
        res.status(200).send({
            id: user.dataValues.id,
            firstname: user.dataValues.firstname,
            lastname: user.dataValues.lastname,
            email: user.dataValues.email,
            account_created: user.dataValues.createdat,
            account_updated: user.dataValues.updatedat
        });
    } else {
        res.status(400).send({
            message: 'User not found!'
        });
    }
}

// Update a user

async function updateUser(req, res, next) {
    if(req.body.email != req.user.email) {
        res.status(400);
    }
    if(!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
        res.status(400).send({
            message: 'Enter all parameters!'
        });
    }
    User.update({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: await bcrypt.hash(req.body.password, 10)
    }, {where : {email: req.user.email}}).then((result) => {
        if (result == 1) {
            res.sendStatus(204);
        } else {
            res.sendStatus(400);
        }   
    }).catch(err => {
        res.status(500).send({
            message: 'Error Updating the user'
        });
    });
}

async function getUserByUsername(email) {
    return User.findOne({where : {email: email}});
}

async function comparePasswords (existingPassword, currentPassword) {
    return bcrypt.compare(existingPassword, currentPassword);
}

module.exports = {
    createUser: createUser,
    getUser: getUser,
    getUserByUsername: getUserByUsername,
    comparePasswords: comparePasswords,
    updateUser: updateUser
};