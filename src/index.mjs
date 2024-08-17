import express from 'express';
import ('./db/mongoose.mjs');
import userRouter from './routers/user.mjs';
import taskRouter from './routers/task.mjs';

const app = express();
const port = process.env.PORT;

app.use(express.json()) //this automatically parses any incoming json as an object
app.use(userRouter)
app.use(taskRouter)

app.listen(port,() => {
    console.log('server is up on '+port)
})

// C:\Program Files\MongoDB\Server\7.0\bin>mongod --dbpath C:\Users\Noble\Mongodb-data