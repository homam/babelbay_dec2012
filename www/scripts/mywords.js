/// <reference path="utils.js" />

myWords = { levels: [], _currentLevel: null };

myWords.findLevelByNum = function (num) {
    var levels = myWords.levels;
    for (var i = 0; i < levels.length; i++) {
        var level = levels[i];
        if (level.num == num)
            return { level: level, index: i };
    }
    return null;
};

myWords.addLevel = function (num) {
    var level = new myWords.level(num);
    this.levels.push(level);
    this._currentLevel = level;
};

myWords.addWord = function (levelNum, wid, audio) {
    var level = null;
    if (this._currentLevel.num != levelNum) {
        var levelItem = myWords.findLevelByNum(levelNum);
        level = levelItem.level;
    } else {
        level = this._currentLevel;
    }
    level.words.push(new myWords.word(wid, audio));
};

myWords.playWord = function (levelNum, wid) {
    var levelItem = myWords.findLevelByNum(levelNum);
    var wordItem = levelItem.level.findWordByWid(wid);
    wordItem.word.play();
};

myWords.removeWord = function (levelNum, wid) {
    var levelItem = myWords.findLevelByNum(levelNum);
    levelItem.level.removeWord(wid);
};


myWords.level = function myWords$Level(num) {
    this.num = num;
    this.words = [];
};

myWords.level.prototype.getWordHtmlId = function (wid) {
    return "myword" + this.num + "_" + wid;
};

myWords.level.prototype.findWordByWid = function (wid) {
    for (var i = 0, length = this.words.length; i < length; i++) {
        var word = this.words[i];
        if (word.wid == wid)
            return { word: word, index: i };
    }
    return null;
};

myWords.level.prototype.removeWord = function (wid) {
    var wordItem = this.findWordByWid(wid);
    
    var self = this;
    var htmlId = self.getWordHtmlId(wordItem.word.wid);
    $addClass(htmlId, "deleting");

    $hide(htmlId);
    self.words.splice(wordItem.index, 1);

    if (self.words.length > 0) {
        $addClass(self.getWordHtmlId(self.words[0].wid), 'first');
        $addClass(self.getWordHtmlId(self.words[self.words.length - 1].wid), 'last');
    } else {
        // no word left in the level
        $hide("level_" + self.num);

        // remove the level
        var levelItem = myWords.findLevelByNum(self.num);
        myWords.levels.splice(levelItem.index, 1);

        if (myWords.levels.length == 0)
            $show('myWords_empty');
    }

    user.myWords = user.myWords || [];
    var el = _.find(user.myWords, function (w) {
        return w.wid == wid;
    });
    if (!!el)
        user.myWords.splice(user.myWords.indexOf(el), 1);
    amplify.store('user', user);


};




myWords.word = function myWords$Word(wid, audio) {
    this.wid = wid;
    this.audio = audio;
};

myWords.word.prototype.play = function () {
    DefaultAudioPlayer.setAudio(this.audio, 2);
    DefaultAudioPlayer.toggle();
};