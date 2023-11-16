"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const userRepository_1 = require("../modules/user/repositories/userRepository");
const userRoutes = (0, express_1.Router)();
exports.userRoutes = userRoutes;
const userRepository = new userRepository_1.UserRepository();
userRoutes.post('/sign-up', (request, response) => {
    userRepository.create(request, response);
});
userRoutes.post('/sign-in', (request, response) => {
    userRepository.login(request, response);
});
