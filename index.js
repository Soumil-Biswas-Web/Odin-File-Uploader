import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import indexRouter from './routes/indexRouter.js';
import authRouter from './routes/authRouter.js';
import filesRouter from './routes/filesRouter.js';
import prisma from './middleware/prismaInit.js';
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import "./middleware/passportFunctions.js";

dotenv.config();

const app = express();

// setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
    },
    store: new PrismaSessionStore(prisma, {
      sessionModelName: "ofu_Session",
      checkPeriod: 2 * 60 * 1000, // 2 minutes
      dbRecordIdIsSessionId: false,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Allow requests from specific origin
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Check if origin contains "localhost"
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'));
        }},
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // If sending cookies or authorization headers
}));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/files", filesRouter);

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
    console.error(err);
    // We can now specify the `err.statusCode` that exists in our custom error class and if it does not exist it's probably an internal server error
    res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})
