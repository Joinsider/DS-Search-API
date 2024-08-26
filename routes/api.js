var express = require('express');
var router = express.Router();

const API = require('../controller/api');
const DB = require('../controller/db');

/* API */

router.get('/', function(req, res, next) {
    DB.initDB();
    res.send('API is working properly');
});

router.post('/login', function(req, res) {
    API.login(req.body);
})

router.get('/checkSchema', function(req, res) {
    const initCorrectly = DB.checkDBSchema();
    if(initCorrectly) {
        res.send('Database schema is correct');
    }else {
        res.statusCode(500).send('Database schema is incorrect');
    }
})

module.exports = router;