"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mysql_1 = require("../../../mysql");
const uuid_1 = require("uuid");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserRepository {
    create(request, response) {
        const { name, email, password } = request.body;
        mysql_1.pool.getConnection((err, connection) => {
            (0, bcrypt_1.hash)(password, 10, (err, hash) => {
                if (err) {
                    return response.status(500).json(err);
                }
                connection.query('INSERT INTO users (user_id,name,email,password) VALUES (?,?,?,?)', [(0, uuid_1.v4)(), name, email, hash], (error, result, fields) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json(error);
                    }
                    response.status(200).json({ message: 'Usuário criado com sucesso' });
                });
            });
        });
    }
    login(request, response) {
        const { email, password } = request.body;
        mysql_1.pool.getConnection((err, connection) => {
            connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
                connection.release();
                if (error) {
                    return response.status(400).json({ error: "Erro na sua autenticação" });
                }
                (0, bcrypt_1.compare)(password, results[0].password, (err, result) => {
                    if (err) {
                        return response.status(400).json({ error: "Erro na sua autenticação" });
                    }
                    if (result) {
                        const token = (0, jsonwebtoken_1.sign)({
                            id: results[0].user_id,
                            email: results[0].email
                        }, process.env.SECRET, { expiresIn: '1d' });
                        return response.status(200).json({ token: token, message: 'Autenticado com sucesso' });
                    }
                });
            });
        });
    }
}
exports.UserRepository = UserRepository;
