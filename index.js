import express from 'express';
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from './secret';
import User from './models/user';
import Solution from './models/solution';
import Skill from './models/skills';
import Favourite from './models/favourites';
import Message from './models/messages';
import SolutionImage from './models/solution_imgs';
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

const uploadSolutionImages = multer({
    storage: uploadImgStorage,
    fileFilter: (req, file, cb) => {
        checkUploadFileType(file, cb);
    }
}).array("solutionImg", 10);

function checkUploadFileType(file, cb){
    //only jpeg jpg png allowed
    const filetypes = /jpeg|jpg|png/;

    const ext = filetypes.test(path.extname(file.originalname).toLowerCase())

    //const mimetype = filetypes.test(file.mimetype);

    if(ext){
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
    console.log(req.body);

    User.forge({
        username,
        email,
        lastname,
        firstname,
        role: "user",
        pass: pass_crypt
    }, { hasTimestamps: true }).save()
        .then(user => res.status(201).json({success: true}))
        .catch(err => res.status(500).json({err: err}));

});

app.post("/api/v1/register_recruiter",(req, res) => {
    
    const { username, email, lastname, firstname, pass, wat, company } = req.body;
    const pass_crypt = bcrypt.hashSync(pass, 10);
    console.log(req.body);

    User.forge({
        username,
        email,
        lastname,
        firstname,
        wat,
        company,
        role: "recruiter",
        pass: pass_crypt
    }, { hasTimestamps: true }).save()
        .then(user => res.status(201).json({success: true}))
        .catch(err => res.status(500).json({err: err}));
});

app.post("/api/v1/login",(req, res) => {
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
                    role: user.get("role")
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
        res.status(201).json({success: model});
    });
});

app.post("/api/v1/solution_upload/:solution", authProtector, (req, res) => {
    //put solution image in the solution_imgs table with id of current solution
    uploadSolutionImages(req, res, (err) => {
        console.log(req.files)
        if(err){
            res.status(400).json({error: err});
        }else{
            new Solution({id: req.params.solution})
            .save({pic_url: req.files[0].filename}, {patch: true})
            .then(function(model) {
               
            });

            Promise.all(
                req.files.map(img => {
                    return new SolutionImage({url: img.filename, solution_id: req.params.solution})
                        .save()
                        .then(function(model) {
                            return model
                    });
                })
            )
            .then(data => res.status(200).json({success: data}));

        }
    })
});

app.get("/api/v1/solution_by_id/:solution", (req, res) => {
    Solution.query({
        where: {id: req.params.solution}
    }).fetch({withRelated: ["solution_imgs"]}).then(sol => {
        if(sol){
            res.json({solution: sol});
        }else{
            res.status(401).json({errors: {msg: "Cannot find solution"}})
        }
    })
});

app.post("/api/v1/delete_solution/:solution", authProtector, (req, res) => {
        SolutionImage.query({
            where: {solution_id: req.params.solution}
        }).destroy().then(model => {
            if(model){
                return Solution.query({where: {id: req.params.solution}}).destroy()
            }
        })
        .then(resp => {
            res.status(200).json({success: "Solution Deleted"})
        })
    
})

app.get("/api/v1/profile/:user", authProtector, (req, res) => {
    User.query({
        where: {username: req.params.user}
    }).fetch({withRelated: ["solutions", "skills"]}).then(user => {
        if (user){
            res.json({
                user: {
                    id: user.get("id"),
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
                    wat: user.get("wat"),
                    company: user.get("company"),
                    experience: user.get("experience"),
                    created_at: user.get("created_at"),
                    solutions: user.toJSON().solutions,
                    skills: user.toJSON().skills,
                    messages: user.toJSON().messages
                }
            });
        }else{
            res.status(401).json({errors: {msg: "Cannot find username"}})
        }
    })
});

app.post("/api/v1/lets_tinder", authProtector, (req, res) => {
    Skill
    .fetchAll()
    .then(skills => {
        let set = new Set();
        skills.map(skill => {
            if(req.body.searchSkills.indexOf(skill.get("name")) > -1 ){
                set.add(skill.get("user_id"));
            }
        })
        return set
    })
    .then(set => {
        return Promise.all(Array.from(set).map(u_id => {
            return User.query({where: {id: u_id}})
                .fetch({withRelated: ["solutions", "skills"]}).then(user => {
                    return user;
                });
            }))
        })
    .then( values => {
        res.status(200).json({userList: values});
    })
});

app.post("/api/v1/addto_fav", authProtector, (req, res) => {
    //quick fix of timestamp issue. need refactoring
    let newFavourite = req.body;
    newFavourite.created_at = new Date();
    newFavourite.updated_at = new Date();

    new Favourite(req.body).save().then(model => {
        res.status(201).json({success: model});
    });
});

app.get("/api/v1/get_favs", authProtector, (req, res) => {
    Favourite.query({where: {recruiter_id: req.currUser.id}})
        .fetchAll().then(favs => {
            return Promise.all(
                favs.map( fav => {
                    return User.query({where: {id: fav.get("who")}}).fetch()
                        .then(user => {
                            return user
                        })
                })
            )
        })
        .then( u => {
            res.status(200).json({favList: u});
        })
});

app.get("/api/v1/get_users", authProtector, (req, res) => {
    User.query({where: {role: "user"}})
        .fetchAll({withRelated: ["solutions", "skills"]}).then(users => {
            res.status(200).json({userList: users});
    })
});

app.post("/api/v1/profile_upload", authProtector, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(400).json({error: err});
        }else{
            new User({id: req.currUser.id})
            .save({profile_pic: req.file.filename}, {patch: true})
            .then(function(model) {
               res.status(200).json({success: req.file.filename});
            });
        }
    });
});

app.post("/api/v1/profile_update", authProtector, (req, res) => {
    const { lastname, firstname, github, linkedin, webpage,
        self_intro, level, experience, skills } = req.body;
    
    new User({id: req.currUser.id})
    .save({
        //user data
        lastname,
        firstname,
        github_url: github,
        linkedin_url: linkedin,
        homepage_url: webpage,
        self_intro,
        level,
        experience
    }, {patch: true})
    .then(function(model) {
        console.log(model);
       res.status(200).json({user: model});
    });
});

app.post("/api/v1/send_msg", authProtector, (req, res) => {
    const from = req.currUser.id;
    const { user_id, text, seen } = req.body;
    const created_at = Date.now();
    const updated_at = Date.now();
    //req.currUser.id
    console.log(from);
    console.log(user_id)
    console.log(text)
    Message.forge({
        from,
        user_id,
        text,
        seen
    }, { hasTimestamps: true }).save()
        .then(msg => res.status(201).json({msg: msg}))
        .catch(err => res.status(500).json({err: err}));
});

app.get("/api/v1/get_msg/:selectedUser", authProtector, (req, res) => {
    Message.query((qdb) => {
        qdb.where("user_id","=",req.params.selectedUser).andWhere("from","=",req.currUser.id);
    })
    .fetchAll()
    .then(msgs => {
        console.log(msgs)
        res.status(200).json({messages: msgs})
    })
});

app.listen(8000, () => console.log("Running on 8000"));