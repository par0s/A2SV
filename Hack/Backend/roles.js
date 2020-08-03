const AccessControl = require('accesscontrol');

const ac = new AccessControl();    

module.exports = (function() {

    ac.grant('ephi_user')      
        .create('local_policy')
        .updateAny('local_policy')
        .deleteAny('local_policy')
      .grant("sysadmin")
        .readAny("comment")
        
    return ac;

})();