import jwt from 'jsonwebtoken';
import { User } from '../models/user.mjs';


export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id:decoded, 'tokens.token':token})

        if(!user) {
            throw new Error('')
        }

        req.token = token
        req.user = user //assigned the user as a property of the request object to be carried on by the router.
        next()
    } catch (e) {
        res.status(401).send('Please get authorization first')
    }
}
