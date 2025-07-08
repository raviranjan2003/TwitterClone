import jwt from 'jsonwebtoken';
import { prisma } from '../clients/db';
import { User } from '@prisma/client';
import { JWTUser } from '../interface';

const jwtSecret = "highsecret";

class JWTServices {
    //Instead of passing userId, we can directly pass User object provided
    // by prisma client, after that we don't need to execute one line 11 extra
    // search operation
    public static async generateToken (user: User) {
        // const user = await prisma.user.findUnique({ where: { id: userId }});

        const payload: JWTUser = {
            id: user?.id,
            email: user?.email
        }
        const token = jwt.sign(payload, jwtSecret);
        return token;
    }

    public static decode(token: string) {
        try {
            return jwt.verify(token, jwtSecret) as JWTUser;
        } catch (error) {
            console.log("Error in decoding token", error);
            return null;
        }
    }
}


export default JWTServices; 