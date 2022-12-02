require("dotenv").config();
const jwt = require("jsonwebtoken");
const { SECRET } = process.env;
const { User } = require("./models/user");
const bcrypt = require("bcryptjs");

const createToken = (username, id) => {
  return jwt.sign(
    {
      username,
      id,
    },
    SECRET,
    {
      expiresIn: "2 days",
    }
  );
};

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      let foundUser = await User.findOne({ where: { username } });
      if (foundUser) {
        const isAuthenticated = bcrypt.compareSync(
          password,
          foundUser.hashedPass
        );
        if (isAuthenticated) {
          const token = createToken(
            foundUser.dataValues.username,
            foundUser.dataValues.id
          );
          const exp = Date.now() + 1000 * 60 * 60 * 48;
          res.status(200).send({
            username: foundUser.dataValues.username,
            userId: foundUser.dataValues.id,
            token,
            exp,
          });
        } else {
          res.status(400).send("cannot log in");
        }
      } else {
        res.status(400).send("cannot log in");
      }
    } catch (error) {
      console.log("Error");
      res.sendStatus(400);
    }
  },

  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      let foundUser = await User.findOne({ where: { username } });
      if (foundUser) {
        res.status(400).send("cannot create user");
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = await User.create({ username, hashedPass: hash });
        const token = createToken(
          newUser.dataValues.username,
          newUser.dataValues.id
        );
        const exp = Date.now() + 1000 * 60 * 60 * 48;
        res.status(200).send({
          username: newUser.dataValues.username,
          userId: newUser.dataValues.id,
          token,
          exp,
        });
      }
    } catch (error) {
      console.log("Error");
      res.sendStatus(400);
    }
  },
};
