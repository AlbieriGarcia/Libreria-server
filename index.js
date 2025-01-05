const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser")
const mongoose = require('mongoose')

mongoose
    .connect(process.env.MONGO_URL).then(() => {
        console.log("Base de Datos conectada")
    }).catch(err => {
        console.log(err)
    })

  
const authRouter = require('./routers/authRouter')
const bookRouter = require('./routers/bookRouter')
const reviewRouter = require('./routers/reviewRouter')
const favoritesRouter = require('./routers/favoritesRouter')
const app = express()
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true, 
  }));

app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter)  
app.use('/api/books', bookRouter)  
app.use('/api/reviews', reviewRouter)  
app.use('/api/favorites', favoritesRouter)  
app.get('/', (req, res) => {
    res.json({message: "Hola desde el servidor"})
})

app.listen(process.env.PORT, () => {
    console.log('El Server esta corriendo...')
})