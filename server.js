const express = require('express')
const app = express()
app.set("view engine", "ejs")
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
const User = require("./models/models")

const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/textbin", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

app.get('/', (req, res) => {
    const code = `Welcome to Textbin.

Write something here.

A textbin is a type of online content-hosting service where users can store plain text.
GitHub Gists are a type of textbin with version control.`
    res.render('index', { code })
})

app.get('/new', (req, res) => {
    res.render('new')
})

app.post('/save', async (req, res) => {
    try {
        const user = await User.create({
            value: req.body.value
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

        res.render('index', { code: user.value, id })
    } catch (e) {
        res.redirect('/')
    }
})

app.get('/:id/duplicate', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)

        res.render('new', { value: user.value })
    } catch (e) {
        res.redirect(`/${id}`)
    }
})

app.listen(3000)