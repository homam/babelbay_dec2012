/// <reference path="lib/_.js" />
step = (function () {
    var currentStep = {
        index: 0, // steps start from 1
        ui: null,
        handler: null // {onNavigatedAway(), onShow(), onNext(callback):bool, onBack(callback):bool }
    };
    // @dir : -1 or 1
    // @gotoStep : the index of the step
    // @extra : extra information to be passed to the step handler s (onNext, onBack)
    return function (dir, gotoStep, extra) { // if gotoStep is true, then it immediately shows the step indicated by the first param (dir).
        var index = !!gotoStep ? dir : (currentStep.index + dir);
        if (index == currentStep.index) return; // do nothing if step has not been changed
        if (index <= 0) { console.log("Cannot go to a step less than 0."); return; } // cannot go to a step before #0
        if (index == 1) { level.disableNav(-1); } else { level.enableNav(-1); }

        var ui = $get("step-" + index);
        if (ui == null) { console.log("No UI was found for this step " + index); return; } // no step was found
        window.ui = ui;

        var nextOrBackCallBack = function () {
            if (currentStep.ui && !BB_DEVICE.supporsHTML5) // hide the current step UI
                $hide(currentStep.ui);

            if (currentStep.handler) { // invoke onNavigatedAway() 
                if (currentStep.handler.onNavigatedAway)
                    currentStep.handler.onNavigatedAway();
            }

            currentStep = { // the step to be displayed
                index: index,
                ui: ui,
                handler: allSteps[index]
            };
            $show(ui, true); // show the step
            
            if (BB_DEVICE.supporsHTML5) {
                $setAttr("levels_container", "style", "height:" + (ui.offsetHeight) + "px");
                $setAttr(document.body, "style", "min-height:" + (ui.offsetHeight) + "px");
            }
            window.location.hash = index; // update URL hash

            if (currentStep.handler && currentStep.handler.onShow)
                currentStep.handler.onShow(); // invoke onShow()


            if (BB_DEVICE.supporsHTML5) {
                var nextUI = $get("step-" + (index + 1));
                if (nextUI) {
                    $show(nextUI, true);
                    $addClass(nextUI, "next");
                }
                var lastUI = $get("step-" + (index - 1));
                if (lastUI) {
                    $show(lastUI, true);
                    $addClass(lastUI, "last");
                }
                $removeClass(ui, "next");
                $removeClass(ui, "last");
            }
        };

        // if currentStep.hanlder has an onNext or onBack, invoke that function.
        // if the function returns false, then it is an async function, exit this method and hand over the execution
        // as a callback to the async function.
        if (currentStep.handler) {
            if (!gotoStep && dir > 0) {
                if (currentStep.handler.onNext) {
                    if (!currentStep.handler.onNext(nextOrBackCallBack, extra))
                        return;
                }
            }
            else if (currentStep.handler.onBack) {
                if (!currentStep.handler.onBack(nextOrBackCallBack, extra))
                    return;
            }
        }

        nextOrBackCallBack();
    };
})();

level = {
    getTestResult: function () {
        var totalQuzzes = 0, totalCorrect = 0;
        for (var i = 0, length = allSteps.length; i < length; i++) {
            var s = allSteps[i];
            if (!!s && !!s.answeredCorrectly) {
                totalQuzzes++;
                totalCorrect += (s.answeredCorrectly() ? 1 : 0);
            }
        }

        return {
            correct: totalCorrect,
            total: totalQuzzes,
            correctRatio: totalCorrect / totalQuzzes
        };
    },
    disableNav: function (dir) {
        $setAttr((dir > 0 ? 'flash_nav_Forawrd_img' : 'flash_nav_Back_img'), 'src',
        'views/generic/bb2images/levels/btn-' + (dir > 0 ? 'next' : 'prev') + '-inactive.png');
    },
    enableNav: function (dir) {
        $setAttr((dir > 0 ? 'flash_nav_Forawrd_img' : 'flash_nav_Back_img'), 'src',
        'views/generic/bb2images/levels/btn-' + (dir > 0 ? 'next' : 'prev') + '-active.png');
    },

    speaker: {
        setAudio: function (url, length) {
            DefaultAudioPlayer.setAudio(url, length);
            $setAttr("flash_navs_speaker_img", 'src', 'views/generic/bb2images/levels/btn-speaker-enabled.png');
        },
        disable: function () {
            $setAttr("flash_navs_speaker_img", 'src', 'views/generic/bb2images/levels/btn-speaker-disabled.png');
        }
    },

    myWords: {

        ui: {
            current: null, // { wid: null, added: false },
            setWid: function (wid) {

                level.myWords.ui.current = { wid: wid, added: false };
                level.myWords.ui.refresh();
            },

            refresh: function () {
                if (!level.myWords.ui.current) return;
                var wid = level.myWords.ui.current.wid;
                var addedWords = level.myWords.addedWords;
                for (var i = 0; i < addedWords.length; i++) {
                    if (addedWords[i] == wid) {
                        level.myWords.ui.current.added = true;
                        break;
                    }
                }

                $setAttr("flash_navs_addword_img", 'src', 'views/generic/bb2images/levels/btn-addword-' +
                    (level.myWords.ui.current.added ? 'added' : 'enabled') + '.png');
            },

            disable: function () {
                $setAttr("flash_navs_addword_img", 'src', 'views/generic/bb2images/levels/btn-addword-disabled.png');
                level.myWords.ui.current = null;
            },
            addWord: function () {
                var current = level.myWords.ui.current;
                if (current)
                    level.myWords.toggleWord(current.wid, function (isRemoved) {
                        $setAttr("flash_navs_addword_img", 'src', 'views/generic/bb2images/levels/btn-addword-' + (isRemoved ? 'enabled' : 'added') + '.png');
                        if (!isRemoved) {
                            if (BB_DEVICE.supporsHTML5) {
                                $addClass("level_notification", "show");
                                setTimeout(function () {
                                    $removeClass("level_notification", "show");
                                }, 2000);
                            } else {
                                $show("level_notification");
                                setTimeout(function () {
                                    $hide("level_notification");
                                }, 1500);
                            }
                        }
                    });
            }
        },

        addedWords: [],

        callWS: function (wid, wsMethod, callback) {
            user.myWords = user.myWords || [];
            var el = _.find(user.myWords, function (w) {
                return w.wid == wid && w.level == LEVEL_NUMBER;
            });
            if ('AddToMyWords' == wsMethod) {
                if (!el) {
                    user.myWords.push({
                        level: LEVEL_NUMBER, wid: wid,
                        target: $(ui).find(".title.target").text(),
                        native: $(ui).find(".title.native").text()
                    });
                }
            } else if ('RemoveFromMyWords' == wsMethod) {
                if (!!el)
                    user.myWords.splice(user.myWords.indexOf(el), 1);
            } else {
                throw 'Not Supported wsMethod'
            }
            amplify.store('user', user);
            callback();
        },

        toggleWord: function (wid, callback) {
            var existingWord = false;
            var exisingIndex = -1;
            for (var i = 0, arr = level.myWords.addedWords; i < arr.length; i++) {
                if (arr[i] == wid) {
                    existingWord = true;
                    exisingIndex = i;
                    break;
                }
            }

            level.myWords.callWS(wid, (existingWord ? 'RemoveFromMyWords' : 'AddToMyWords'), function () {
                if (!existingWord) {
                    level.myWords.addedWords.push(wid);
                } else {
                    level.myWords.addedWords.splice(exisingIndex, 1);
                }
                callback(existingWord);
            });
        },
        removeWord: function (wid) {

        }
    }
};

(function () {
    // URL hash 

    window.stepInHash = function () {
        var stepIndex = parseInt(window.location.hash.replace("#", ""));
        step(!isNaN(stepIndex) ? stepIndex : 1, true);
    };

    $attachEvent(window, 'load', function () {
        //stepInHash();
    });

    // listen to hash changes
    (function () {
        var lastHash = window.location.hash;
        setInterval(function () {
            var hash = window.location.hash;
            if (hash != lastHash) {
                stepInHash();
                lastHash = hash;
            }
        }, 500);
    })();

})();



// my words

(function () {

    level.myWords.addedWords = _.filter(user.myWords, function (w) {
        return w.level == LEVEL_NUMBER;
    }).map(function(w) {
        return w.wid;
    });
    level.myWords.ui.refresh();

})();