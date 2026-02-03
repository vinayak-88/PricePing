require("dotenv").config();
const express = require("express")
const { connectDB } = require("./config/database");

const app = express()

const PORT = process.env.PORT
connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log("server running")
    })
}).catch((err)=>{
    console.log("error connecting to the database")
})