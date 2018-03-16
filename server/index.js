import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from '../secret';
import User from '../models/user';
import authProtector from '../middlewares/auth';

let app = express();

app.use(bodyParser.json());

app.get("/",(req, res) => {
    res.send("Init")
});

app.post("/api/v1/register",(req,res) => {
    
    const { username, email, lastname, firstname, pass } = req.body;
    const pass_crypt = bcrypt.hashSync(pass, 10);
    console.log(req.body)

    User.forge({
        username,
        email,
        lastname,
        firstname,
        pass: pass_crypt
    }, { hasTimestamps: true }).save()
        .then(user => res.status(201).json({success: true}))
        .catch(err => res.status(500).json({err: err}));

});

app.post("/api/v1/login",(req,res) => {
    const {authCred, pass} = req.body;

    User.query({
        where: {username: authCred},
        orWhere: {email: authCred}
    }).fetch().then(user => {
        if (user){
            if (bcrypt.compareSync(pass, user.get("pass"))){
                const token = jwt.sign({
                    id: user.get("id"),
                    username: user.get("username"),
                    isUser: true
                }, secret.jwtSecretKey);

                res.send({token});
            }else{
                res.status(401).json({errors: {msg: "Invalid Username/Password"}})
            }
        }else{
            res.status(401).json({errors: {msg: "Invalid Username/Password"}})
        }
    })
});

app.get("/api/v1/profile/:user", authProtector, (req, res) => {
    User.query({
        where: {username: req.params.user}
    }).fetch({withRelated: ["solutions"]}).then(user => {
        if (user){
            console.log(user.toJSON())
            res.json({
                user: {
                    username: user.get("username"),
                    lastname: user.get("lastname"),
                    firstname: user.get("firstname"),
                    email: user.get("email"),
                    created_at: user.get("created_at"),
                    solutions: user.toJSON().solutions
                }
            });
        }else{
            res.status(401).json({errors: {msg: "Cannot find username"}})
        }
    })
});

app.listen(8000, () => console.log("Running on 8000"));