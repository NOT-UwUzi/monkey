const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(".database/user.db");
var fs = require('fs');
const cors = require("cors");
var bodyParser = require('body-parser');

const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'myPWA/pfps')
    },
    filename: (req, file, cb) => {
        // console.log(file);
        let x = Date.now() + file.originalname;
        cb(null, x);
        db.prepare(`UPDATE user SET imagelink = '${x}' WHERE currentlyactive = 'true'`).run();
        console.log(`UPDATE pfp TO ${x}`);
    }
})

const upload = multer({ storage: storage });

const app = express();
app.use(express.static(path.join(__dirname, "myPWA")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "myPWA/index.html"));
});

app.use(cors());
app.use(express.json());

app.use(
    bodyParser.urlencoded({
    extended: true
    }),
    express.static(path.join(__dirname, "myPWA"))
)

app.post('/profile', upload.single('avatar'), function (req, res) {
    // console.log(req.body.songname);
    // console.log(req.files);
    // db.prepare(`UPDATE user SET imagelink = '${Date.now()}${req.files.originalname}' WHERE currentlyactive = 'true'`).run()
    // res.json({valid:true});
})

app.post('/getuseractive', function(req,res) {
    db.all(`SELECT * FROM user WHERE currentlyactive = 'true'`, function(err,rows) {
        if (err) console.log(err);

        res.json({num: rows.length});
        console.log(`THERE ARE ${rows.length} USERS THAT ARE active`)
    })
})

app.post('/deactivateallusers', function(req,res) {
    db.prepare(`UPDATE user SET currentlyactive = 'false'`).run();
    console.log('DEACTIVATING ALL users');
    res.json({valid: true});
})

app.post('/getshadow', function(req,res) {
    db.all(`SELECT * FROM user WHERE currentlyactive = 'true'`, function(err, rows) {
        if (err) console.log(err);

        res.json({valid: rows[0].shadowenabled});
        console.log(`RETURNED shadow AS ${rows[0].shadowenabled}`);
    })
})

app.post('/toggleshadow', function(req, res) {
    db.all(`SELECT * FROM user WHERE currentlyactive = 'true'`, function(err, rows) {
        if (err) console.log(err);

        let x = rows[0].shadowenabled;
        if (x == 'true') {
            db.prepare(`UPDATE user SET shadowenabled = 'false' WHERE currentlyactive = 'true'`).run();
            console.log(`SET shadowenabled FOR ${rows[0].name} TO BE false`);
        } else {
            db.prepare(`UPDATE user SET shadowenabled = 'true' WHERE currentlyactive = 'true'`).run();
            console.log(`SET shadowenabled FOR ${rows[0].name} TO BE true`);
        }
        res.json({valid: true});
    })
})

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'myPWA/music')
    },
    filename: (req, file, cb) => {
        // console.log(file);
        let x = Date.now() + file.originalname;
        db.prepare(`UPDATE songs SET songfile = '${x}' WHERE recentlyadded = 'true'`).run();
        cb(null, x);
    }
})

const upload2 = multer({ storage: storage2 });

const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'myPWA/music')
    },
    filename: (req, file, cb) => {
        // console.log(file);
        let x = Date.now() + file.originalname;
        db.prepare(`UPDATE songs SET imagefile = '${x}' WHERE recentlyadded = 'true'`).run();
        db.prepare(`UPDATE songs SET recentlyadded = 'false'`).run();
        cb(null, x);
    }
})

const upload3 = multer({ storage: storage3 });

app.post("/addsongfiles", upload2.array("files"), function (req, res) {
    res.json({valid:true});
});

app.post("/addimagefiles", upload3.array("files"), function (req, res) {
    res.json({valid:true});
});

app.post('/checklikedsongs', function(req,res) {
    db.all("SELECT * FROM songs WHERE liked = 'true'", function(err,rows) {
        if (err) console.log(err);
        let x = rows.length;
        console.log("THERE ARE " + x + " LIKED SONGS")
        res.json({valid: x})
    })
})

app.post('/addsongs', function(req,res) {
    db.all("SELECT * FROM songs WHERE songname = ?", [req.body.songname], function(err, rows) {
        if (err) console.log(err);
        let x = rows.length;
        if (x == 1) res.json({valid: false});
        else {
            db.prepare(`INSERT into songs (songname, artist, liked, useradded, songlink, recentlyadded) VALUES ('${req.body.songname}', '${req.body.artist}', 'false', 'true', '${req.body.artistlink}', 'true')`).run();
            console.log(`INSERTED new song NAMED ${req.body.songname}, ARTIST ${req.body.artist}, LINK ${req.body.artistlink}`);
            res.json({valid:true})
        }
    })
})

app.post('/userrole', function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err, rows) {
        if (err) console.log(err);

        let x = rows[0].name;
        res.json({x})
    })
})

app.post('/getinvert', function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err, rows) {
        if (err) {console.log(err);}
        // console.log(rows);
        let x = rows[0].inverted;
        // x == true ? x = false : x = true;
        console.log("RETURNING INVERTED AS", x);
        res.json({valid: x});
    })
})

app.post('/changeinvert', function (req,res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err, rows) {
        if (err) {console.log(err);}
        if (rows[0].inverted == 'false') {
            console.log("CHANGED inverted to TRUE");
            db.prepare(`UPDATE user SET inverted = 'true' WHERE currentlyactive = 'true'`).run()
        } else {
            console.log("CHANGED inverted to FALSE");
            db.prepare(`UPDATE user SET inverted = 'false' WHERE currentlyactive = 'true'`).run();
        }
        res.json({valid: true});
    })
})

app.post("/findpfp", function (req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}

        // console.log(rows[0].imagelink);
        res.json({pfp: rows[0].imagelink});
        console.log("GOT " + rows[0].imagelink + " AS PFP")
    })
})

app.post("/findusername", function (req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}

        // console.log(rows[0].imagelink);
        res.json({pfp: rows[0].name});
        console.log("GOT " + rows[0].name + " AS USERNAME")
    })
})

app.post("/changepassword", function(req, res) {
    let valid = true;
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}
        if (rows[0].password == req.body.newpass || rows[0].password != req.body.oldpass) res.json({valid:false});
        else {
            if (valid == true) {
                db.prepare(`UPDATE user SET password = '${req.body.newpass}' WHERE currentlyactive = 'true'`).run();
                console.log(`UPDATED PASSWORD to ${req.body.newpass}`)
                res.json({valid:true})
            }
        }
    })
})

app.post("/changeusername", function(req, res) {
    db.prepare(`UPDATE user SET name = '${req.body.newuser}' WHERE currentlyactive = 'true'`).run();
    console.log(`UPDATED USERNAME to ${req.body.newuser}`)
    res.json({valid:true})
})

app.post("/changepasswordone", function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}
        if (rows[0].password != req.body.oldpass) {
            res.json({valid:false});
            console.log(rows[0].password + " " + req.body.oldpass)
        }
        else res.json({valid:true});
    })
})

app.post("/changepasswordtwo", function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}
        if (rows[0].password == req.body.newpass) res.json({valid:false});
        else res.json({valid:true});
    })
})

app.post("/changepasswordthree", function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}
        if (rows[0].password == req.body.pass) res.json({valid:true});
        else res.json({valid:false});
    })
})

app.post("/changeusernameone", function(req, res) {
    db.all("SELECT * FROM user WHERE currentlyactive = 'true'", function(err,rows) {
        if (err) {console.log(err);}
        if (rows[0].name == req.body.newpass) res.json({valid:false});
        else res.json({valid:true});
    })
})

app.post("/changeusernametwo", function(req, res) {
    let x = true;
    db.all("SELECT * FROM user", function(err,rows) {
        if (err) {console.log(err);}
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].name == req.body.newpass) x = false;
        }
        res.json({valid: x});
    })
})

app.post("/activateuser", function (req) {
    db.prepare(`UPDATE user SET currentlyactive = 'true' WHERE name = '${req.body.user}'`).run();
})

app.post("/deactivateuser", function () {
    db.prepare(`UPDATE user SET currentlyactive = 'false' WHERE currentlyactive = 'true'`).run();
})

app.post("/getsongs", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='false'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songname);
        }
        res.json(x);
    })
})

app.post("/getsongartists", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='false'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].artist);
        }
        res.json(x);
    })
})

app.post("/getsongartistlinks", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='false'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songlink);
        }
        res.json(x);
    })
})

app.post("/getsongaudios", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded = 'false'", function(err,rows) {
        if (err) console.log(err); 
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songfile);
        }
        res.json(x);
    })
})

app.post("/getsongimages", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded = 'false'", function(err,rows) {
        if (err) console.log(err); 
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].imagefile);
        }
        res.json(x);
    })
})

app.post("/getaddedsongs", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='true'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songname);
        }
        res.json(x);
    })
})

app.post("/getaddedsongartists", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='true'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].artist);
        }
        res.json(x);
    })
})

app.post("/getaddedsongartistlinks", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded='true'", function(err, rows) {
        if (err) {console.log(err);}
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songlink);
        }
        res.json(x);
    })
})

app.post("/getaddedsongaudios", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded = 'true'", function(err,rows) {
        if (err) console.log(err); 
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].songfile);
        }
        res.json(x);
    })
})

app.post("/getaddedsongimages", function (req, res) {
    db.all("SELECT * FROM songs WHERE useradded = 'true'", function(err,rows) {
        if (err) console.log(err); 
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            x.push(rows[i].imagefile);
        }
        res.json(x);
    })
})

app.post("/checklogin", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ? and password LIKE ?", [req.body.user, req.body.pass], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 1) res.json({ valid: true});
        else res.json({ valid: false });
    })
})

app.post("/checkvaliduser", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ?", [req.body.user], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length >= 1) res.json({ valid: true});
        else res.json({ valid: false });
    })
})

app.post("/checkvalidpass", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ? and password LIKE ?", [req.body.user, req.body.pass], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 1) res.json({ valid: true});
        else res.json({ valid: false });
    })
})

app.post("/createuser", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ? OR email LIKE ?", [req.body.newuser, req.body.newemail], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 0) {
            db.prepare(`INSERT INTO user (name, password, email, currentlyactive, imagelink, inverted, shadowenabled) VALUES ('${req.body.newuser}', '${req.body.newpass}', '${req.body.newemail}', 'true', 'anonymous.webp', 'false', 'true')`).run();
            res.json({ valid: true });
        } else res.json({ valid: false })
    });
});

app.post("/checktakenusername", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ?", [req.body.newuser], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 0) res.json({ valid: true });
        else res.json({ valid: false });
    });
});

app.post("/checktakenemail", function (req, res) {
    db.all("SELECT * FROM user WHERE email LIKE ?", [req.body.newemail], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 0) res.json({ valid: true });
        else res.json({ valid: false });
    });
});

app.post("/checkregister", function (req, res) {
    db.all("SELECT * FROM user WHERE name LIKE ? OR email LIKE ?", [req.body.newuser, req.body.newemail], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (rows.length == 0) {
            // db.prepare(`INSERT INTO user (name, password, email) VALUES ('${req.body.newuser}', '${req.body.newpass}', '${req.body.newemail}')`).run();
            res.json({ valid: true });
        } else res.json({ valid: false })
    });
});

app.post("/checksearch", function (req, res) {
    console.log("input is '" + req.body.search + "'");
    db.all("SELECT * FROM songs WHERE songname LIKE ? OR artist LIKE ?", [`%${req.body.search}%`, `%${req.body.search}%`], function(err, rows) {
        if (err) {
            console.log(err);
        }
        let x=[];
        for(let i = 0; i < rows.length; i++) {
            // console.log("matching songs are " + rows[i].songname);
            // res.json(rows[i].songname);
            x.push(rows[i].songname);
        }
        console.log(x);
        res.json(x);
    });
});

app.listen(5500, () => console.log("active server!!"));

// const registerServiceWorker = async () => {
//     if ("serviceWorker" in navigator) {
//         try {
//         const registration = await navigator.serviceWorker.register("/sw.js", {
//             scope: "/",
//         });
//         if (registration.installing) {
//             console.log("Service worker installing");
//         } else if (registration.waiting) {
//             console.log("Service worker installed");
//         } else if (registration.active) {
//             console.log("Service worker active");
//         }
//         } catch (error) {
//         console.error(`Registration failed with ${error}`);
//         }
//     }
// };

// const cacheFirst = async (request) => {
//     const responseFromCache = await caches.match(request);
//     if (responseFromCache) {
//         return responseFromCache;
//     }
//     return fetch(request);
// };

// self.addEventListener("fetch", (event) => {
//     event.respondWith(cacheFirst(event.request));
// });

// registerServiceWorker();

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker
//         .register('/service-worker.js')
//         .then((registration) => {
//             console.log('Service Worker registered with scope:', registration.scope);
//         })
//         .catch((error) => {
//             console.error('Service Worker registration failed:', error);
//         });
//     });
// }