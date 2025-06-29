document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == 'a') {
        masteryValue[0]+=10;
        weightValue[0]+=10;
        greenProgress[0]+=10;
        
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == 'e') {
        masteryValue[1]+=10;
        weightValue[1]+=10;
        greenProgress[1]+=10;
        
    }
});
