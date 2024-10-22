const express = require('express');
// const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mySqlPool = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

//configure dotenv
dotenv.config()

//rest object
const app = express();
app.use(cors());
app.use(bodyParser.json());

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

//port
const PORT = process.env.PORT || 8000;

//routes
app.use('/api/v1/doc', require("./routes/docroute"));

app.get("/test", (req,res) => {
    res.status(200).send ('<h1>Test</h1>');
});


//db connect
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit the process if connection fails
  } else {
    console.log('MySQL Connected...');
  }
});


// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    const query = 'SELECT * FROM doc WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ message: 'Server error' });
  
        if (isMatch) {
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ message: 'Invalid email or password' });
        }
      });
    });
  });


db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});


//conditionally listen
mySqlPool.query('SELECT 1').then(() => {
//mysql
console.log('MySQL DB connected');

//listen
app.listen (PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});
}).catch((error) => {
    console.log('error');
});

