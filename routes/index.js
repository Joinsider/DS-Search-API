var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/sharedFolders', (req, res) => {
    res.render('sharedFolders', { title: 'Shared Folders' });
})

router.get('/folder', (req, res) => {
    res.render('folder', { title: 'Folder' });
});

module.exports = router;
