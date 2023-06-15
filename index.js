import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import pool from "./database/connection.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import bcrypt from "bcryptjs";
import { verify } from "jsonwebtoken";
import morgan from "morgan";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.post("/usuarios", async (req, res) => {
    const {email, password, rol, lenguage} = req.body;
    try {
        if(!email || !password || !rol || !lenguage) { 
            throw{message: "se necesita el email y la contraseña"};
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const text = "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)";
        const {rows} = await pool.query(text, [email, hashPassword, rol, lenguage]); 
        res.json({rows});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:error.message});
    }
});

app.get("/usuarios", verifyToken, async (req, res) => {
    try{
        const text = "SELECT * FROM usuarios WHERE email = $1"
        const {rows} = await pool.query(text, [req.email]);
        res.json(rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:error.message});
    }
});

app.post("/login", async (req, res) => { 
    const {email, password} = req.body;
    try {
        if(!email || !password) {
            throw{message: "se necesita el email y la contraseña"};
        }

        //verificar credenciales
        const text = "SELECT * FROM usuarios WHERE email = $1";
        const {rows: [userDB],
             rowCount,
            } = await pool.query(text, [email]); 

        if(!rowCount) {
            throw{message: "No existe el usuario"};
        }

        const verifyPass = await bcrypt.compare(password, userDB.password);

        if(!verifyPass) {
            throw{message: "Contraseña incorrecta"};
        }

        // generar jwt
        const token = jwt.sign({email}, process.env.JWT_PASS);
        res.json({token});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:error.message});
    }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});