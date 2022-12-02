require("dotenv").config();

const { sequelize } = require("../util/database");
const { User } = require("./models/user");
const { Post } = require("./models/post");

const express = require("express");
const cors = require("cors");

const { PORT } = process.env;

User.hasMany(Post);
Post.belongsTo(User);

const {
  getAllPosts,
  getCurrentUserPosts,
  addPost,
  editPost,
  deletePost,
} = require("./controllers/posts");
const { register, login } = require("./controllers/auth");
const { isAuthenticated } = require("./middleware/isAuthenticated");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/register", register);
app.post("/login", login);
app.post("/posts", isAuthenticated, addPost);

app.get("/posts", getAllPosts);
app.get("/userposts/:userId", getCurrentUserPosts);

app.put("/posts/:id", isAuthenticated, editPost);

app.delete("/posts/:id", isAuthenticated, deletePost);

sequelize
  .sync({ force: true })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`sync successful and server running on port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));
