var MONGOHQ_URL='mongodb://ahadik:C0mmunityS3rvice!@kahana.mongohq.com:10042/advocate-local';

// npm install mongodb
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
 
MongoClient.connect(MONGOHQ_URL, function(err, db) {
	console.log(db);
  // operate on the collection named "test"
  var collection = db.collection('registrations');
 
  // remove all records in collection (if any)
  console.log('removing documents...')
  collection.remove(function(err, result) {
    if (err) {
      return console.error(err)
    }
    console.log('collection cleared!')
    // insert two documents
    console.log('inserting new documents...')
    collection.insert([{name: 'tester'}, {name: 'coder'}], function(err,
docs) {
      if (err) {
        return console.error(err)
      }
      console.log('just inserted ', docs.length, ' new documents!')
      collection.find({}).toArray(function(err, docs) {
        if (err) {
          return console.error(err)
        }
        docs.forEach(function(doc) {
          console.log('found document: ', doc)
        })
      })
    })
  })
})