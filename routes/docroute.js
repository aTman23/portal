const express = require('express');
const { getdoc, getdocbyid, createDoctor, updatedoc } = require('../controllers/doc_controller');

//router object
const router = express.Router();

//routes


//get all doctors list
router.get('/getall', getdoc);

//get student by id
router.get("/get/:UserID", getdocbyid);

//create doctor || post
router.post('/create', createDoctor);

//update doctor 
router.put('/update/:UserID',updatedoc)

//Login Route


module.exports = router;