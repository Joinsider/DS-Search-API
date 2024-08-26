const DB = require('./db');
const SynAPI = require('./synapi');


function login(reqbody) {
    reqbody = JSON.parse(reqbody);
    console.log(reqbody);
    const db = DB.initDB();
    const resp = DB.insertAuth(db, reqbody.username, reqbody.password, reqbody.otp_required);

    if(!resp) {
        console.log("Error in inserting auth");
        return false;
    }
    console.log("Auth inserted successfully");


}

module.exports = {
    login
}