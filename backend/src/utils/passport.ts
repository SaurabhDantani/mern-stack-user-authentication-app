import passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { JwtPayload } from "jsonwebtoken";
import dbUtils from "./db.utils";
import { User } from "../entities/users";

import dotenv from 'dotenv';
dotenv.config();

const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTH_SECRET_KEY || 'ILove_Node'
}

const jwtStrategy = new Strategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
        const now = Date.now();
        const connection = await dbUtils.getDefaultConnection();
        const repo = connection.getRepository(User);
        if(payload.exp && payload.exp < now / 1000) {
            return done(null, false, { message: 'Token expired' });
        }
        const member = await repo.createQueryBuilder("user")
            .where("user.id = :id", { id: payload.id })
            .getRawOne();

        if (member) {
            done(null, member);
        } else {
            done(null, false);
        }
    } catch (error) {
        done(error, false);
    }
});

passport.use('jwt', jwtStrategy);

export default passport;