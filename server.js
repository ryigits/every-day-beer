const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const hb = require("express-handlebars");
const db = require("./db");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
app.listen(process.env.PORT || port, () => console.log(`petition listening on port ${port}!`));
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}
const { userLogedIn} = require("./middleware");
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.use(
    express.urlencoded({
        extended: false,
    })
);
let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    sessionSecret = require("./secrets").SESSION_SECRET;
}


const register = require("./routers/register");
const login = require("./routers/login");
const petition = require("./routers/petition");
const edit = require("./routers/edit");
const deleteUser = require("./routers/deleteUser");
app.use(register);
app.use(login);
app.use(petition);
app.use(edit);
app.use(deleteUser);
app.use(express.static("./public"));
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.get("/", userLogedIn, (req, res) => {
    res.redirect("/petition");
});

app.get("/list", (req, res) => {
    db.getAllUsers().then((users) => {
        let list = users.rows;
        res.render("list", {
            list: list,
            logged: true,
            name: req.session.name,
        });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
