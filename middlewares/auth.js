import jwt from 'jsonwebtoken';
import secret from '../secret';
import User from '../models/user';

export default (req, res, next) => {
    const authHeader = req.headers["x-sollib-token"];

    if(authHeader){
        jwt.verify(authHeader, secret.jwtSecretKey, (err, decoded) => {
            if(err){
                res.status(401).json({error: "Failed to authenticate"});
            }else{

                new User({ id: decoded.id }).fetch().then(user => {
                    if(!user){
                        res.status(404).json({error: "Cant find user"});
                    }

                    req.currUser = user;

                    next();
                })
            }
        });
    }else{
        res.status(403).json({error: "Missing auth token"});
    }
}