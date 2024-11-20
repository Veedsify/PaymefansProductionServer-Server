// Serve API routes on /api, restricted to api.example.com
app.use("/api", (req, res, next) => {
    if (req.hostname === "api.example.com") {
        next();
    } else {
        res.status(404).send("Not found");
    }
}, apiRouter);

// Serve verification routes on /verification, accessible to all subdomains
app.use("/verification", verificationRouter);

// Middleware to restrict access to /admin routes to only admin.paymefans.com
app.use("/admin", (req, res, next) => {
    if (req.hostname === "admin.paymefans.com") {
        next();
    } else {
        res.status(404).send("Not found");
    }
}, adminRouter);