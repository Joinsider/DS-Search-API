var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/sharedFolders', (req, res) => {
    const path = req.query.path;

    if(path) {
        // Set the cookie
        res.cookie('selectedFolder', path).render('sharedFolders', { title: 'Shared Folders' });
    }

    res.render('sharedFolders', { title: 'Shared Folders' });
})

router.get('/folder', (req, res) => {
    const path = req.query.path;

    if(path) {
        // Set the cookie
        res.cookie('selectedFolder', path).render('sharedFolders', { title: 'Shared Folders' });
    }

    res.render('sharedFolders', { title: 'Shared Folders' });
});

module.exports = router;
