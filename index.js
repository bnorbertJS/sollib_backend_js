import express from 'express';
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from './secret';
import User from './models/user';
import Solution from './models/solution';
import authProtector from './middlewares/auth';

let app = express();

app.use(bodyParser.json());
app.use(express.static('./public/uploads/images'));

const uploadImgStorage = multer.diskStorage({
    destination: "./public/uploads/images",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: uploadImgStorage,
    fileFilter: (req, file, cb) => {
        checkUploadFileType(file, cb);
    }
}).single("profileImg");

function checkUploadFileType(file, cb){
    //only jpeg jpg png allowed
    const filetypes = /jpeg|jpg|png/;

    const ext = filetypes.test(path.extname(file.originalname).toLowerCase())

    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && ext){
        return cb(null, true);
    }else{
        cb("Only images please!");
    }
}

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

app.post("/api/v1/new_solution", authProtector, (req, res) => {
    const newSolution = req.body;
    newSolution.user_id = req.currUser.id;

    //quick fix of timestamp issue. need refactoring
    newSolution.created_at = new Date();
    newSolution.updated_at = new Date();

    new Solution(newSolution).save().then(model => {
        res.status(201).json({success: "Created successfully"});
    });
});

app.get("/api/v1/profile/:user", authProtector, (req, res) => {
    User.query({
        where: {username: req.params.user}
    }).fetch({withRelated: ["solutions"]}).then(user => {
        if (user){
            res.json({
                user: {
                    username: user.get("username"),
                    lastname: user.get("lastname"),
                    firstname: user.get("firstname"),
                    email: user.get("email"),
                    profile_pic: user.get("profile_pic"),
                    github: user.get("github_url"),
                    linkedin: user.get("linkedin_url"),
                    webpage: user.get("homepage_url"),
                    self_intro: user.get("self_intro"),
                    level: user.get("level"),
                    experience: user.get("experience"),
                    created_at: user.get("created_at"),
                    solutions: user.toJSON().solutions
                }
            });
        }else{
            res.status(401).json({errors: {msg: "Cannot find username"}})
        }
    })
});
// ATTENTION: MUST BE REFACTORED, THIS ROUTE MUST BE PROTECTED AND THE ID IS HARDCODED
app.post("/api/v1/profile_upload" ,(req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(400).json({error: err});
        }else{
            new User({id: 1})
            .save({profile_pic: req.file.filename}, {patch: true})
            .then(function(model) {
                res.writeHead(301, {
                    Location: "http" + (req.socket.encrypted ? "s" : "") + "://" + 
                      req.headers.host + "/#/edit_profile"
                  });
                res.end();
            });
        }
    });
});

app.post("/api/v1/profile_update",(req, res) => {

});

app.listen(8000, () => console.log("Running on 8000"));