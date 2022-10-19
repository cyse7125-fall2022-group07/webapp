const db = require('../config/sequelizeDB.js');
const User = db.users;
const Lists = db.lists;
const bcrypt = require('bcrypt');
const {v4:uuidv4} = require('uuid');

async function createList (req, res, next) {

}