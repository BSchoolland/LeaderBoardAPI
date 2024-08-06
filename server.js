const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const port = 3004;

app.use(express.json());

// Allow all CORS origins
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Serve the index.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/highscore", (req, res) => {
    // Log headers and raw body for debugging
    console.log("Headers:", req.headers);
    req.on('data', chunk => {
        console.log("Raw body chunk:", chunk.toString());
    });

    // Log parsed body
    console.log("Parsed body:", req.body);

    const { initials, score, level } = req.body;
    if (!initials || !score || !level) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let tableName;
    switch (parseInt(level)) {
        case 1:
            tableName = "highscores_level1";
            break;
        case 2:
            tableName = "highscores_level2";
            break;
        case 3:
            tableName = "highscores_level3";
            break;
        default:
            return res.status(400).json({ error: "Invalid level" });
    }

    db.run(`INSERT INTO ${tableName} (initials, score) VALUES (?, ?)`, [initials, score], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Get the count of scores lower than the newly inserted score
        db.get(`SELECT COUNT(*) AS lower_count FROM ${tableName} WHERE score < ?`, [score], (err, lowerRow) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Get the total count of scores
            db.get(`SELECT COUNT(*) AS total_count FROM ${tableName}`, (err, totalRow) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const lowerCount = lowerRow.lower_count + 1; // Include the player's score
                const totalCount = totalRow.total_count;
                const percentBetterThan = (lowerCount / totalCount) * 100;

                res.json({ percentBetterThan: percentBetterThan.toFixed(0) });
            });
        });
    });
});


app.get("/api/highscores", (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const level = parseInt(req.query.level, 10) || 1;
    const timeframe = req.query.timeframe || 'all';

    let tableName;
    switch (level) {
        case 1:
            tableName = "highscores_level1";
            break;
        case 2:
            tableName = "highscores_level2";
            break;
        case 3:
            tableName = "highscores_level3";
            break;
        default:
            return res.status(400).json({ error: "Invalid level" });
    }

    let timeframeCondition = '';
    switch (timeframe) {
        case 'day':
            timeframeCondition = "AND timestamp >= datetime('now', '-1 day')";
            break;
        case 'week':
            timeframeCondition = "AND timestamp >= datetime('now', '-7 days')";
            break;
        case 'all':
            timeframeCondition = '';
            break;
        default:
            return res.status(400).json({ error: "Invalid timeframe" });
    }

    db.all(`SELECT initials, score, timestamp FROM ${tableName} WHERE 1=1 ${timeframeCondition} ORDER BY score DESC LIMIT ?`, [limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
