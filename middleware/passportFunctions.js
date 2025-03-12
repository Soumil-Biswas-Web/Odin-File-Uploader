import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import prisma from './prismaInit.js';

passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await prisma.ofu_User.findUnique({
          where: {
            username: username.toLowerCase(),
          },
        });

        console.log(user);
  
        if (!user) {
          console.log("Incorrect username");
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        console.log("password match: ", match);
        if (!match) {
          console.log("Incorrect password");
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch(err) {
        console.error(err);
        return done(err);
      }
    })
  );
  
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.ofu_User.findUnique({
          where: {
            id,
          }
        });
        done(null, user);
    } catch(err) {
        done(err, null);
        console.error(err);
    }
});