const db = require('../config/sequelizeDB.js');
const User = db.users;
const Lists = db.lists;
const Tasks = db.tasks;
const bcrypt = require('bcrypt');
const {v4:uuidv4} = require('uuid');
const {
    comparePasswords
} = require('./usersController.js');

const {
    
} = require('./listsController');

async function checkValidity(req, res, field) {
    console.log('check valid '+field)
    if(!req.body[field] ){
        return res.status(400).send({
            message: 'Error Updating the List try passing '+field+' in body'
        });
        return true;
    }
}

async function checkListIdBelongToUser(req, res) {
    const lists = await getListByUsernameAndID(req.user.email, req.body.listId)

    if( lists == ''){
        res.status(400).send({
            message: 'Invalid listId for this user'
        });
        return true
    }
}

async function createTask (req, res, next) {
   
    if(await checkValidity(req, res,'listId' ) && await checkListIdBelongToUser(req, res) && await checkValidity(req, res,'task' ) ){
        return;
    }
    if( await checkListIdBelongToUser(req, res)){
        return
    }
    

    const user = await getUserByUsername(req.user.email);
    var task = {
        id: uuidv4(),
        listid: req.body.listId,
        task: req.body.task,
        summary: req.body.summary,
        duedate: req.body.dueDate,
        priority: req.body.priority,
        state: req.body.state 
        
    };
    Tasks.create(task).then(async tdata => {
        res.status(201).send(
        tdata);
    }).catch(err => {
        // logger.error(" Error while creating the user! 500");
        res.status(500).send({
            message: err.message || "Some error occurred while creating the list!"
        });
    });
}

async function updateTask(req, res, next) {
    console.log('update task')
    const user = await getUserByUsername(req.user.email);
    
    if(await checkValidity(req, res,'taskId' )){
        return;
    }
    if( await checkListIdBelongToUser(req, res)){
        return;
    }
    console.log(req.body.priority)
    Tasks.update({ 
        task: req.body.task,
        summary: req.body.summary,
        duedate: req.body.dueDate,
        priority: req.body.priority,
        state: req.body.state 
    }, {where : {id: req.body.taskId}}).then((result) => {

        if (result == 1) {
            res.sendStatus(204);
        } else {
            res.status(400).send({
                message: 'Invalid listId'
            });
        }   
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            message: 'Error Updating the List try passing listId in body'
        });
    });
}

async function deleteTaskByListId(req, res, next) {
    if(await checkValidity(req, res,'listId' )){
        return;
    }
    if( await checkListIdBelongToUser(req, res)){
        return;
    }
    const deletedTask = await Tasks.destroy({where: {  listid: req.body.listId} })
    return deletedTask;

}

async function deleteTaskByTaskId(req, res, next) {
    
    if(await checkValidity(req, res,'taskId' )){
        return;
    }
    const lists = await Tasks.findAll({where: { id: req.body.taskId }}); 
    // console.log('xxxxxxxxxxxxxxx list ',JSON.stringify( lists[0].listid) )
    if(lists == ''){
        res.status(400).send({
            message: 'Invalid taskId for this user'
        });
        return;
    }
    req.body.listId = lists[0].listid || ''
    if( await checkListIdBelongToUser(req, res)){
        return
    }
    const deletedTask = await Tasks.destroy({where: {  id: req.body.taskId} })
    res.status(204).send({deletedTask})

}

async function getAllTask (req, res, next) {

    const lists = await getTaskByUsername(req.user.email);

    res.status(200).send({
        lists: lists
    })

}

async function getTaskByTaskID (req, res, next) {
    
    if(await checkValidity(req, res,'taskId' )){
        return;
    }
    const lists = await Tasks.findAll({where: { id: req.body.taskId }}); 
    // console.log('xxxxxxxxxxxxxxx list ',JSON.stringify( lists[0].listid) )
    if(lists == ''){
        res.status(400).send({
            message: 'Invalid taskId for this user'
        });
        return;
    }
    req.body.listId = lists[0].listid || ''
    if( await checkListIdBelongToUser(req, res)){
        return
    }
    // const lists = await Tasks.findAll({where: { listid: req.body.listId }});  //getTaskByListID( req.body.listId);
    res.status(200).send(lists)
}

async function getTaskByListID(req, res, next) {
    
    if(await checkValidity(req, res,'listId') ) {
        return;
    }
    if( await checkListIdBelongToUser(req, res)){
        return
    }
    const lists = await Tasks.findAll({where: { listid: req.body.listId }});  //getTaskByListID( req.body.listId);
    res.status(200).send(lists)
}

async function getTaskByUsername(email) {
    const user = await getUserByUsername(email);
    const list = Lists.findAll({where: { userid: user.id}})
    return Tasks.findAll({where: { listId: list.id }})
}

async function getTaskByUsernameAndTaskID(email, id) {
    const user = await getUserByUsername(email);
    return Tasks.findAll({where: { userid: user.id,  id: id} })
}

async function  deleteByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Tasks.destroy({where: { userid: user.id,  id: id} })
}

async function getUserByUsername(email) {
    return User.findOne({where : {email: email}});
}

async function getListByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Lists.findAll({where: { userid: user.id,  id: id} })
}

module.exports = {
    createTask: createTask,
    updateTask: updateTask,
    getAllTask: getAllTask,
    getTaskByTaskID: getTaskByTaskID,
    getTaskByListID: getTaskByListID,
    deleteTaskByTaskId: deleteTaskByTaskId
};