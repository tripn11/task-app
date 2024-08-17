import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Task } from '../models/task.mjs';

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim:true
    },
    email: {
        type:String,
        unique:true, 
        required: true,
        lowercase:true,
        validate (value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password:{
        type:String,
        required: true,
        validate(password) {
            if(password.length < 6 || password.toLowerCase().includes('password')) {
                throw new Error('password has a wrong format')
            }
        }
    },
    age: {
        type:Number,
        default:0
    },
    tokens: [{
        token: {
            type:String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks', { //the virtual doesn't store an actual data in the database but generates the data from the database.
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//to create a custom method for user
userSchema.methods.generateAuthToken = async function () {
    //'this' represents the specific user that wants to generate a token.
    const token = jwt.sign({_id:this._id.toString()}, 'learning jwt')
    this.tokens.push({token})
    await this.save()
    return token
}

userSchema.methods.toJSON = function () { //to JSON is inbuilt and automatically runs when a response is sent.
    const userObject = this.toObject() //to remove other mongoose specific properties and return a raw js object.
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//to create a custom method for User
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user) {
        throw new Error ('Incorrect Details')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) {
        throw new Error('Incorrect Details')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
    //next is important for most middleware to signify the end of the function and for the next task in line to begin
})

userSchema.pre('deleteOne', {document:true}, async function (next) {
    await Task.deleteMany({owner:this._id})
    next()
})

export const User = mongoose.model('User', userSchema)