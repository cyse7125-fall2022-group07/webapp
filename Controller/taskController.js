const db = require('../config/sequelizeDB.js');
const User = db.users;
const Lists = db.lists;
const Tasks = db.tasks;
const Comments = db.comments;
const Reminder = db.reminders;
const bcrypt = require('bcrypt');
const {
    v4: uuidv4
} = require('uuid');
const {
    comparePasswords
} = require('./usersController.js');

const {

} = require('./listsController');

async function checkValidity(req, res, field) {
    console.log('check valid ' + field)
    if (!req.body[field]) {
        return res.status(400).send({
            message: 'Error Updating the List try passing ' + field + ' in body'
        });
        return true;
    }
}

async function checkListIdBelongToUser(req, res) {
    const lists = await getListByUsernameAndID(req.user.email, req.body.listId)

    if (lists == '') {
        res.status(400).send({
            message: 'Invalid listId for this user'
        });
        return true
    }
}

async function checkValidStatus(req, res) {
    console.log('checkValidStatus',req.body.state, req.body.state != 'TODO' && req.body.state != 'COMPLETE' && req.body.state != 'OVERDUE' )
    if ( req.body.state != 'TODO' && req.body.state != 'COMPLETE' && req.body.state != 'OVERDUE' ) {
        res.status(400).send({
            message: 'Invalid state for task, try passing TODO, COMPLETE, OVERDUE'
        });
        return true
    }
}

async function checkValidStatusDate(req, res) {
    console.log("checkValidStatusDate", req.body.dueDate);
    const date1 = new Date(req.body.dueDate);
    const date2 = new Date();
    const diffTime = date1 - date2;
    console.log(date1, date2.setHours(0, 0, 0, 0), diffTime);
    var currstate = req.body.state;

    if( currstate != 'COMPLETE' && diffTime<0){
        currstate = "OVERDUE"
    }
    if( currstate != 'COMPLETE' && diffTime>0){
        currstate = "TODO"
    }
    console.log(currstate)
    Tasks.update({
        state: currstate
    }, {
        where: {
            id: req.body.taskId
        }
    }).then((result) => {
        console.log('result', result);
        return false
    }).catch(err => {
        console.log('error checkValidStatusDate',err);
        res.status(500).send({
            message: 'Error Updating the task'
        });
        return true;
    });

}

async function createTask(req, res, next) {

    if (await checkValidity(req, res, 'listId') && await checkListIdBelongToUser(req, res) && await checkValidity(req, res, 'task')) {
        return;
    }
    if (await checkListIdBelongToUser(req, res)) {
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

    if (await checkValidity(req, res, 'taskId')) {
        return;
    }
    const lists = await Tasks.findAll({
        where: {
            id: req.body.taskId
        }
    });
    // console.log('xxxxxxxxxxxxxxx list ',JSON.stringify( lists[0].listid) )
    if (lists == '') {
        res.status(400).send({
            message: 'Invalid taskId for this user'
        });
        return;
    }
    req.body.listId = lists[0].listid || ''
    if (await checkListIdBelongToUser(req, res)) {
        return
    }
    if(await checkValidStatus(req, res)) {
        return;
    }

    if(await checkValidStatusDate(req, res)) {
        return;
    }
    console.log('after checkValidStatusDate')
    console.log(req.body.priority)
    Tasks.update({
        task: req.body.task,
        summary: req.body.summary,
        duedate: req.body.dueDate,
        priority: req.body.priority
    }, {
        where: {
            id: req.body.taskId
        }
    }).then((result) => {

        

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

async function deleteTaskByTaskId(req, res, next) {

    if (await checkValidity(req, res, 'taskId')) {
        return;
    }
    const lists = await Tasks.findAll({
        where: {
            id: req.body.taskId
        }
    });
    // console.log('xxxxxxxxxxxxxxx list ',JSON.stringify( lists[0].listid) )
    if (lists == '') {
        res.status(400).send({
            message: 'Invalid taskId for this user'
        });
        return;
    }
    req.body.listId = lists[0].listid || ''
    if (await checkListIdBelongToUser(req, res)) {
        return
    }
    const deletedcomment = await Comments.destroy({
        where:{
            taskid: req.body.taskId
        }
    })
    const deletedreminder = await Reminder.destroy({
        where:{
            taskid: req.body.taskId
        }
    })
    const deletedTask = await Tasks.destroy({
        where: {
            id: req.body.taskId
        }
    })
   
    res.status(204).send({
        deletedTask
    })

}

async function getTaskByTaskID(req, res, next) {

    if (await checkValidity(req, res, 'taskId')) {
        return;
    }
    
    const lists = await Tasks.findAll({
        where: {
            id: req.body.taskId
        }
    });
    // console.log('xxxxxxxxxxxxxxx list ',JSON.stringify( lists[0].listid) )
    if (lists == '') {
        res.status(400).send({
            message: 'Invalid taskId for this user'
        });
        return;
    }
    req.body.listId = lists[0].listid || ''
    if (await checkListIdBelongToUser(req, res)) {
        return
    }
    // const lists = await Tasks.findAll({where: { listid: req.body.listId }});  //getTaskByListID( req.body.listId);
    res.status(200).send(lists)
}

async function getTaskByListID(req, res, next) {

    if (await checkValidity(req, res, 'listId')) {
        return;
    }
    if (await checkListIdBelongToUser(req, res)) {
        return
    }
    const lists = await Tasks.findAll({
        where: {
            listid: req.body.listId
        }
    }); //getTaskByListID( req.body.listId);
    res.status(200).send(lists)
}

async function getTaskByUsernameAndTaskID(email, id) {
    const user = await getUserByUsername(email);
    return Tasks.findAll({
        where: {
            userid: user.id,
            id: id
        }
    })
}

async function deleteByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Tasks.destroy({
        where: {
            userid: user.id,
            id: id
        }
    })
}

async function getUserByUsername(email) {
    return User.findOne({
        where: {
            email: email
        }
    });
}

async function getListByUsernameAndID(email, id) {
    const user = await getUserByUsername(email);
    return Lists.findAll({
        where: {
            userid: user.id,
            id: id
        }
    })
}

module.exports = {
    createTask: createTask,
    updateTask: updateTask,
    getTaskByTaskID: getTaskByTaskID,
    getTaskByListID: getTaskByListID,
    deleteTaskByTaskId: deleteTaskByTaskId
};