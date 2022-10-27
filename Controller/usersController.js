const db = require('../config/sequelizeDB.js');
const User = db.users;
const bcrypt = require('bcrypt');
const {v4:uuidv4} = require('uuid');
const { createList} = require('./listsController');

// Create a User
async function createUser (req, res, next) {
    
    console.log('create user')
    var hash = await bcrypt.hash(req.body.password, 10);
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(req.body.email)) {
        // logger.info("/create user 400");
        res.status(400).send({
            message: 'Enter your Email ID in correct format. Example: abc@xyz.com'
        });
    }
    const getUser = await User.findOne({
        where: {
            email: req.body.email
        }
    }).catch(err => {
        // logger.error("/create user error 500");
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the user'
        });
    });

    console.log('verified and existing 1');

   
    if (getUser) {
        console.log('verified and existing', getUser.dataValues.isVerified);
        var msg = getUser.dataValues.isVerified ? 'User already exists! & verified' : 'User already exists! & not verified';
        console.log('verified and existing msg' ,msg);
        
        res.status(400).send({
            message: msg
        });
    } else {
        var user = {
            id: uuidv4(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: hash,
            email: req.body.email,
            is_verified: true
        };
        console.log('above user');
        User.create(user).then(async udata => {

                const randomnanoID = uuidv4();

                const expiryTime = new Date().getTime();

                // Create the Service interface for dynamoDB
                // var parameter = {
                //     TableName: 'csye6225Pro2',
                //     Item: {
                //         'Email': {
                //             S: udata.email
                //         },
                //         'TokenName': {
                //             S: randomnanoID
                //         },
                //         'TimeToLive': {
                //             N: expiryTime.toString()
                //         }
                //     }
                // };
                // console.log('after user');
                // //saving the token onto the dynamo DB
                // try {
                //     var dydb = await dynamoDatabase.putItem(parameter).promise();
                //     console.log('try dynamoDatabase', dydb);
                // } catch (err) {
                //     console.log('err dynamoDatabase', err);
                // }

                // console.log('dynamoDatabase', dydb);
                // var msg = {
                //     'email': udata.email,
                //     'token': randomnanoID
                // };
                // console.log(JSON.stringify(msg));

                // const params = {

                //     Message: JSON.stringify(msg),
                //     Subject: randomnanoID,
                //     TopicArn: 'arn:aws:sns:us-east-1:861022598256:verify_email'

                // }
                // var publishTextPromise = await sns.publish(params).promise();

                // console.log('publishTextPromise', publishTextPromise);
                req.body.listname = 'default list'
                req.user = {
                    email: req.body.email,
                    password: req.body.email
                }
                createList(req, res , next);
                return
                // res.status(201).send({
                //     id: udata.id,
                //     firstname: udata.firstname,
                //     lastname: udata.lastname,
                //     email: udata.email,
                //     account_created: udata.createdAt,
                //     account_updated: udata.updatedAt,
                //     isVerified: udata.isVerified
                // });

            })
            .catch(err => {
                // logger.error(" Error while creating the user! 500");
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the user!"
                });
            });
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // var hash = await bcrypt.hash(req.body.password, 10);
    // const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    // if(!emailRegex.test(req.body.email)) {
    //     res.status(400).send({
    //         message: 'Enter your Email ID in correct format. Example: abc@xyz.com'
    //     });
    // }
    // const getUser = await User .findOne({where: {email: req.body.email}}).catch(err => {
    //     res.status(500).send({
    //         message: err.message || 'Some error occurred while creating the user'
    //     });
    // });
    // if(getUser) {
    //     res.status(400).send({
    //         message: 'User already exists!'
    //     });

    // } else {
    //     var user = {
    //         id: uuidv4(),
    //         firstname: req.body.firstname,
    //         lastname: req.body.lastname,
    //         password: hash,
    //         email: req.body.email
    //     };
    
    // User.create(user).then(data => {
    //     res.status(201).send({
    //         id: data.id,
    //         firstname: data.firstname,
    //         lastname: data.lastname,
    //         email: data.email,
    //         account_created: data.createdat,
    //         account_updated: data.updatedat
    //     });
    // })
    // .catch(err => {
    //     console.log(err)
    //     res.status(500).send({
    //         message:
    //             err.message || "Some error occurred while creating the user!"
    //     });
    // });
    // }
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
    console.log('mail '+req.body.email)
    User.update({ 
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: await bcrypt.hash(req.body.password, 10)
    }, {where : {email: req.body.email}}).then((result) => {

        if (result == 1) {
            res.sendStatus(204);
        } else {
            res.sendStatus(400);
        }   
    }).catch(err => {
        console.log(err);
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