import { Router } from "express";
import bcrypt from 'bcryptjs';
import passport from "passport";
import prisma from "../middleware/prismaInit.js";

const route = Router();

// Get Login Page
route.get('/login', async (req, res) => {
    res.render("layout.ejs", {
        title: "Login | Odin-File-Uploader",
        body: "components/login.ejs",
    });    
});

// Login in user
route.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await prisma.ofu_User.findUnique({
      where: {
        username: username.toLowerCase(),
      },
    });
    console.log(user);
    if (!user) {
      res.status(400).json({message: "Invalid username or password"});
    }
    else {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          res.status(400).json({message: "Invalid password"});
        }
    }
    passport.authenticate("local", {
    successRedirect: "/files/dashboard",
    failureRedirect: "/auth/login"
    })(req, res, next);
});

// Get SIgn Up Page
route.get('/signUp', async (req, res) => {
    res.render("layout.ejs", {
        title: "Sign Up | Odin-File-Uploader",
        body: "components/signUp.ejs",
    });
});

// Sign up User
route.post('/signUp', async (req, res) => { 
    const data = req.body;
    console.log(data);
    const {username, password, password2} = data;
    try {
        if (password !== password2) {
            res.status(400).json({message: 'The passwords entered do not match. Please make sure they are the same.'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await prisma.ofu_User.create({
            data: {
                username: username.toLowerCase(),
                password: hashedPassword
            }
        })
        
        res.status(201).json({message: `User ${username} created successfully`});    
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({message: 'Username already exists!'});
        } else {
            console.error('Error :', error);
            res.status(500).json({message: 'Server error'});
        }          
    }
});

route.get("/log-out", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
});

export default route;