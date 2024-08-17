import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
    description: {
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User' //this allows us to use task.populate(owner) to get the entire user profile instead of just user id 
    }
},{
    timestamps:true
})

export const Task = mongoose.model('Task', taskSchema)