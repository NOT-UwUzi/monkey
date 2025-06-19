CREATE TABLE user(userID INT NOT NULL,name TEXT NOT NULL PRIMARY KEY,email TEXT NOT NULL,password TEXT NOT NULL);
INSERT INTO user(userID,name,email password) VALUES ("1","FISH","stinks","test");

CREATE TABLE songs(songname TEXT NOT NULL, artist TEXT NOT NULL);
INSERT INTO songs(songname, artist) VALUES ("closetothesun", "thefatrat");
INSERT INTO songs(songname, artist) VALUES ("sundown", "jamesprimate");

SELECT * FROM user;
SELECT * FROM user WHERE language LIKE "%BASH%";

SELECT * FROM songs WHERE songname LIKE "%the%" OR artist LIKE "%primate%";