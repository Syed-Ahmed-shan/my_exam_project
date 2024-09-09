const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const port = 3090;

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/data_info', {
   
});

const db = mongoose.connection;
db.once('open', () => {
    console.log("Mongodb Connection Successful");
});
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const registerSchema = new mongoose.Schema({
    phno: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const Register = mongoose.model('registers', registerSchema);

const userSchema = new mongoose.Schema({
    phno: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    course: String, 
    branch: String, 
    year: String,
    answers: Object,
    marks: Number
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register-authenticate', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register-authenticate', async (req, res) => {
    const { phno, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new Register({
            phno,
            email: email.toLowerCase().trim(),
            password : hashedPassword
        });

        await user.save();
        return res.redirect('/index.html');
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).send('Failed to register user');
    }
});

//here the login problem is that the user is not getting logged in  and the error is that the user is not getting logged in

app.post('/index/authenticate', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Attempting login with email:', email);
        const query = { email: email.toLowerCase().trim() };
        const user = await User.findOne(query);
        if (!user) {
            console.log('User not found for email:', email);
             res.status(401).send('Invalid credentials');
        }

        console.log('User Found:', user);

        const match = await bcrypt.compare(password, user.password);
        if(match) {
            console.log('Password matched for user:', user.email);
            
            redirect('/details.html');
           
        } else {
            console.log("Password did not math for User !", user.email);
             res.status(401).send('Invalid  password');
        }            
            
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Failed to authenticate');
    }
});

app.post('/submit_exam', async (req, res) => {
    const { email, q1, q2 } = req.body;
    const correctAnswers = { q1: '4', q2: 'Paris' };
    let marks = 0;

    if (q1 === correctAnswers.q1) marks++;
    if (q2 === correctAnswers.q2) marks++;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { answers: { q1, q2 }, marks } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ marks });
    } catch (err) {
        console.error('Error submitting exam:', err);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
});

app.listen(port, () => {
    console.log('Server started at port number :' + port);
});
