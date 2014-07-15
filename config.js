var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/advocate'
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE registrations (orgtype text, orgname text, email text)');
query.on('end', function() { client.end(); });