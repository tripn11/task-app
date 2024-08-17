import express from 'express';
import {auth} from '../middleware/auth.mjs';
import { Task } from '../models/task.mjs';

const router = new express.Router()

router.post("/tasks",auth, async (req, res) => {
    const task = new Task({...req.body,owner:req.user._id});
    try {
        const saved = await task.save()
        res.status(201).send(saved);
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/tasks", auth, async (req, res) => {
    try {
        const match = {}
        const sort = {}

        if(req.query.completed) {
            match.completed = req.query.completed === 'true';
        }

        if(req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]]=parts[1]==='desc'?-1:1;
        }

        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
    }
})

router.get("/tasks/:id",auth, async (req,res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner:req.user._id});
        if(!task) {
            return res.status(404).send()
        }else {
            res.send(task)
        }
    } catch (e) {
        res.status(500).send(e)
    }}
)

router.patch("/tasks/:id", auth, async (req,res) => {
    const allowableUpdates = ["description","completed"]
    const requestedUpdates = Object.keys(req.body)
    const okayRequest = requestedUpdates.every(item=>allowableUpdates.includes(item))

    if(!okayRequest) {
        return res.status(400).send({error:"this update is not allowed"})
    }
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        if(!task) {
            return res.status(400).send()
        }

        requestedUpdates.forEach(each=>task[each]=req.body[each])
        await task.save()
        res.status(200).send(task)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const selectedTask = await Task.findOne({_id:req.params.id,owner:req.user._id})

        if(!selectedTask) {
            return res.status(404).send({error:"This task does not exist"})
        }
        await selectedTask.deleteOne()
        res.status(200).send(selectedTask)
    } catch (e) {
        res.status(500).send(e)
    }
})

export default router;