// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Now require and run the simple server
require('./simple-server.js');