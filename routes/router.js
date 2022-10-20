const router = require('express').Router();
const baseAuthentication = require('../util/auth.js');
const userController = require('../Controller/usersController.js');

const listsController = require('../Controller/listsController.js');

// GET Method

router.get("/healthz", (req, res) => {
    console.log("Is it hitting?")
    res.sendStatus(200).json();
});

// POST Method

router.post("/v1/user", userController.createUser);

// GET Method (With Authentication)

router.get("/v1/user/self", baseAuthentication() , userController.getUser);

// PUT Method

router.put("/v1/user/self", baseAuthentication() , userController.updateUser);

//Add List
router.post("/v1/user/list", baseAuthentication(), listsController.createList);

//update List
router.put("/v1/user/listupdate", baseAuthentication(), listsController.updateList);

//get all list 
router.get("/v1/user/getalllist", baseAuthentication(), listsController.getAllList);

//get list 
router.get("/v1/user/getlist", baseAuthentication(), listsController.getListByID);

//get list 
router.delete("/v1/user/deletelist", baseAuthentication(), listsController.deleteList);


module.exports = router; 