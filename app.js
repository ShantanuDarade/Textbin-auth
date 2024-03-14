require("dotenv").config()

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require("./models/models")
const Auth = require("./models/auth")

const PORT = process.env.PORT || 3000

const app = express()
app.set("view engine", "ejs")
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

app.get('/',tokenCheck, async (req, res) => {
    const code = `Welcome to Textbin.

Write something here.

A textbin is a type of online content-hosting service where users can store plain text.
GitHub Gists are a type of textbin with version control.`
    const links = await User.find({createdBy:req.decode.id})
    res.render('index', { code, links })
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', async (req,res) => {
    try {
        const {name,email,password} = req.body

        const existingUser = await Auth.findOne({email})
        if(existingUser) {
            return res.status(400).json({message:"User already exists"})
        }
        const encPassword =  await bcrypt.hash(password, 10)

        await Auth.create({
            name,email,password:encPassword
        })
        res.redirect('/login')
    } catch (error) {
        console.log(error)
    }
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', async (req,res) => {
    try {
        const {email,password} = req.body
    
        const user = await Auth.findOne({email})
        if(!user) {
            return res.status(400).json({message:"User not found"})
        }
    
        const passMatch = await bcrypt.compare(password, user.password)
    
        if(!passMatch) {
            return res.redirect('/login')
        }
        if(user && passMatch) {
            const token = jwt.sign({id: user._id},process.env.SECRET,{expiresIn: '3d'})
            res.cookie("token",token, { expires: new Date(Date.now()+ 3*24*60*60*1000) })
        }

        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
})

app.get('/new',tokenCheck, (req, res) => {
    res.render('new')
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login')
})

app.post('/save',tokenCheck, async (req, res) => {
    try {
        const user = await User.create({
            value: req.body.value,
            createdBy: req.decode.id
        })
        res.redirect(`/${user.id}`)
    } catch (error) {
        res.render('/new', { value })
    }
})

app.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        const links = []

        res.render('index', { code: user.value, id, links })
    } catch (e) {
        res.redirect('/')
    }
})

app.get('/:id/duplicate',tokenCheck, async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)

        res.render('new', { value: user.value })
    } catch (e) {
        res.redirect(`/${id}`)
    }
})

function tokenCheck(req,res,next) {
        const {token}  = req.cookies

        if(!token) {
            return res.redirect('/login')
        }

        jwt.verify(token,process.env.SECRET,(err, decode) => {
            if(err) return res.redirect('/login')
            req.decode = decode
            next()
        })
        
}

app.listen(PORT)