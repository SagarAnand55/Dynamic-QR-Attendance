
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {StudentModel,ProfessorsModel, OtherUsersModel} = require("../Models/users-model");


const generateToken = (user) => {
  const token = jwt.sign({userId: user._id, fullName: user.fullName, email: user.email}, "SWE_SECRET_KEY", { expiresIn: '28d' });
  return token;
};

exports.studentSignup = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await StudentModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const newStudent = new StudentModel(req.body);
    await newStudent.save();

    res.status(201).send({ message: 'Student account created successfully' });
  } catch (error) {
    console.error('Error creating student account:', error.message);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.professorSignup = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await ProfessorsModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const newProfessor = new ProfessorsModel(req.body);
    await newProfessor.save();

    res.status(201).send({ message: 'Professor account created successfully' });
  } catch (error) {
    console.error('Error creating professor account:', error.message);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.otherUserSignup = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await OtherUsersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const newUser = new OtherUsersModel(req.body);
    await newUser.save();

    res.status(201).send({ message: 'Other user account created successfully' });
  } catch (error) {
    console.error('Error creating other user account:', error.message);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).send({ message: 'Email, password, and role are required' });
    }

    let user;

    switch (role) {
      case 'student':
        user = await StudentModel.findOne({ email });
        break;
      case 'professor':
        user = await ProfessorsModel.findOne({ email });
        break;
      case 'other':
        user = await OtherUsersModel.findOne({ email });
        break;
      default:
        return res.status(400).send({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).send({ message: 'Invalid User' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    const token = generateToken(user);
    res.status(200).send({ token: token, message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully` });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).send({ message: 'Internal server error' });
  }
};

