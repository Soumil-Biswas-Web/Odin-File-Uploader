import { Router } from "express";

const route = Router();

let folders;

// Render  Page by default
route.get('/', async (req, res) => {
    // console.log (req.user);
    try {

        res.render("layout.ejs", {
            title: "Odin-File-Uploader",
            body: "components/home.ejs",
            user: req.user
        });

    } catch (error) {
        console.log('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default route;