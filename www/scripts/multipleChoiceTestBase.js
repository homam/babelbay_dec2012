/// <reference path="utils.js" />
/// <reference path="levels.js" />

// extending step
multipleChoiceTestBase = {
    _correctChoiceId: 'id',
    _choiceIds: [],
    _question: 'id',
    _answer: 'id',
    _userSelectedChoiceId: null,
    answeredCorrectly: function () {
        return (this._correctChoiceId == this._userSelectedChoiceId);
    },
    onShow: function () {
        if (this._userSelectedChoiceId)
            $get(this._userSelectedChoiceId).checked = true;
        else
            level.disableNav(1);

        level.speaker.disable();
        level.myWords.ui.disable();
    },
    onNext: function (callBack) {
        var checkedElId = null;
        var choiceIds = this._choiceIds;
        for (var i = 0; i < choiceIds.length; i++) {
            var el = $get(choiceIds[i]);
            if (el.checked) {
                checkedElId = choiceIds[i];
                break;
            }
        }
        if (checkedElId == null) {
            console.log("checkedElId cannot be null");
            return false; // a choice must be selected
        }
        this._userSelectedChoiceId = checkedElId;

        var correct = this.answeredCorrectly();

        if (correct) {
            $removeClass(this._answer, "wrong");
            $addClass(this._answer, "correct");
        } else {
            $removeClass(this._answer, "correct");
            $addClass(this._answer, "wrong");
        }

        $showAll(this._answer);
        $hide(this._question);

        setTimeout(callBack, 1000);

        return false;
    },
    onNavigatedAway: function () {
        // reset
        $hideAll(this._answer);
        $show(this._question);
        level.enableNav(1);
    }
};

multipleChoiceTestLinkOptions = $extend({
    onShow: function () {
        if (this._userSelectedChoiceId)
            $addClass(this._userSelectedChoiceId, "selected");
        else
            level.disableNav(1);

        level.speaker.disable();
        level.myWords.ui.disable();
    },
    onNext: function (callback, extra) {
        var choiceId;
        if (!extra || !extra.choiceId) {
            if (this._userSelectedChoiceId)
                choiceId = this._userSelectedChoiceId;
            else {
                console.log("extra.choiceId cannot be null");
                return false;
            }
        } else {
            choiceId = extra.choiceId;
        }

        if (choiceId == this._userSelectedChoiceId) {
            return true; // user is just navigating
        }

        if (!!this._userSelectedChoiceId)
            $removeClass(this._userSelectedChoiceId, "selected");

        this._userSelectedChoiceId = choiceId;

        var correct = this.answeredCorrectly();

        $addClass(choiceId, "selected");
        $addClass(choiceId, correct ? "correct" : "wrong");

        setTimeout(function () {
            setTimeout(function () {
                callback();
            }, 1000);
        }, 200);

        return false;
    }
}, multipleChoiceTestBase, true);