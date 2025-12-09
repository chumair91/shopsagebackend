import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypyt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET,{expiresIn:"7d"});
};

// Get current user info
const getUserInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

//Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user does not exist" });
    }
    const isMatch = await bcrypyt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "user already exists in our system",
      });
    }
    //check valid email and password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Plz enter a strong password",
      });
    }
    //hashing user password
    const salt = await bcrypyt.genSalt(10);
    const hashedPassword = await bcrypyt.hash(password, salt);
    //shorter version
    /*const hashedPassword = await bcrypt.hash(password, 10);*/

    //after all validations lets register the user
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Route for admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.json({ success: false, message: "plz provide email" });
  }
  if (!password) {
    return res.json({ success: false, message: "plz Enter password" });
  }
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = createToken(email + password);
    console.log(token);
    res.json({ success: true, token: token });
  }
};
export { loginUser, registerUser, adminLogin, getUserInfo };
