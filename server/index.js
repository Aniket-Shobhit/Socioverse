import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url'
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { users, posts } from './data/index.js';

import dotenv from 'dotenv';
dotenv.config();

// configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    next();
});

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected successffully!');
    app.listen(PORT,() => {
        console.log('App is running on server '+PORT);
    });

    //dummy data, inserted only once at start 
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((e) => {
    console.log(e.message);
});


