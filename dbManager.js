const Datastore = require('nedb');
const path = require('path');
const db = {};

db.users =  new Datastore({ filename: path.join(__dirname, 'db/users.db'), autoload: true });
db.requests =  new Datastore({ filename: path.join(__dirname, 'db/requests.db'), autoload: true });

db.users.loadDatabase();
db.requests.loadDatabase();


const dbActions = {
  users: {
    create(params) {
      db.users.insert(params)
    }
  },

  requests: {
    create(params) {
      db.requests.insert(params);
    },
    getAll() {
      db.requests.find({}, (docs) => new Promise.resolve(docs))
    }
  }
}


module.exports = dbActions;
