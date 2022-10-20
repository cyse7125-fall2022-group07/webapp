const db = require('../config/sequelizeDB.js');
const User = db.users;
const Lists = db.lists;
const bcrypt = require('bcrypt');
const {v4:uuidv4} = require('uuid');
const {
    getUserByUsername,
    comparePasswords
} = require('./usersController.js');

async function createList (req, res, next) {
    const user = await getUserByUsername(req.user.email);
    var list = {
        id: uuidv4(),
        userid: user.id,
        name: req.body.name
        
    };
    Lists.create(list).then(async ldata => {
        res.status(201).send({
            id: ldata.id,
            name: ldata.name
        });
    }).catch(err => {
        // logger.error(" Error while creating the user! 500");
        res.status(500).send({
            message: err.message || "Some error occurred while creating the list!"
        });
    });
}


async function updateList (req, res, next) {
    const user = await getUserByUsername(req.user.email);
   
    Lists.update({ 
        name: req.body.name
    }, {where : {id: req.body.listId}}).then((result) => {

        if (result == 1) {
            res.sendStatus(204);
        } else {
            res.sendStatus(400);
        }   
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            message: 'Error Updating the List try passing listId in body'
        });
    });
}

async function deleteList (req, res, next) {
    const rslt = await deleteByUsernameAndID(req.user.email, req.body.listId);

    res.status(200).send({
        result: rslt
    })

}

async function getAllList (req, res, next) {
    const lists = await getListByUsername(req.user.email);

    res.status(200).send({
        lists: lists
    })

}

async function getListByID (req, res, next) {
    const lists = await getListByUsernameAndID(req.user.email, req.body.listId);
    res.status(200).send(lists)
}

async function getListByUsername(email) {
    const user = await getUserByUsername(email);
    return Lists.findAll({where: { userid: user.id}})
}

async function getListByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Lists.findAll({where: { userid: user.id,  id: id} })
}

async function  deleteByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Lists.destroy({where: { userid: user.id,  id: id} })
}

module.exports = {
    createList: createList,
    updateList: updateList,
    getAllList: getAllList,
    getListByID: getListByID,
    deleteList: deleteList
};