import express from 'express';
import { User }  from '../models/user.mjs';
import { auth } from '../middleware/auth.mjs';
import multer from 'multer';
// import sharp  from 'sharp'; //to adjust image format and size
import { sendWelcomeEmail, sendGoodbyeEmail } from '../emails/accounts.mjs';


const router = new express.Router();

router.post("/users", async (req, res) => {
    
    const user = new User(req.body)
    try {
        
        await user.save();
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post("/users/login", async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken()
        res.send({user, token});
    }catch (e){
        res.status(400).send(e)
    }
})

router.post("/users/logout", auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token=>token.token !== req.token)
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send(e)
    }
})

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send(e)
    }
})

router.get("/users/me", auth, (req,res) => {
    res.send(req.user)
})

router.patch("/users/me", auth,  async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','age','password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error:"invalid update"}) 
    }

    try {
        updates.forEach(update=>req.user[update]= req.body[update])

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete("/users/me",auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
        sendGoodbyeEmail(req.user.email, req.user.name)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Not a valid format'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    try {
        // const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        // req.user.avatar = buffer
        req.user.avatar = req.file.buffer;
        await req.user.save()
        res.send()
    } catch (e) {
        res.send(e)
    }
}, (error, req, res, next) => {
    res.status(404).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.status(200).send()
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error('this is me ')
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e)
    }
})

export default router
