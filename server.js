const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const hb = require("express-handlebars");
let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    sessionSecret = require("./secrets.json").SESSION_SECRET;
}

if (process.env.NODE_ENV == "production") {
    sessionSecret = process.env.SESSION_SECRET;
} else {
    sessionSecret = require("./secrets.json").SESSION_SECRET;
}
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
app.listen(process.env.PORT || port, () =>
    console.log(`petition listening on port ${port}!`)
);

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: true,
    })
);
app.use(
    express.urlencoded({
        extended: false,
    })
);

const register = require("./routers/register");
const login = require("./routers/login");
const petition = require("./routers/petition");
const edit = require("./routers/edit");
const deleteUser = require("./routers/deleteUser");
const changePassword = require("./routers/changePassword");
const list = require("./routers/list");
app.use(register);
app.use(login);
app.use(petition);
app.use(edit);
app.use(changePassword);
app.use(deleteUser);
app.use(list);

app.use(express.static("./public"));
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    res.redirect("/register");
});
// kayittan sonra redirect lazim !!!


app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
