BB_DEVICE = {
supporsHTML5: true
};

var parseJSON = function (data) {
    return ('string' == typeof data) ? JSON.parse(data) : data;
}

var user = amplify.store("user");
if (!user && document.location.href.search(/chooselang.html/i)<0)
    document.location = 'ChooseLang.html';
if (!user) {
    user = {
        level: 1,
        levelsHistory: {}
    };
}

var templateThisPage = function (promises) {
    $.when($.ajax({ url: "res//partials//appmenu_navs.html", dataType: 'html' }),
        $.ajax('res//data//website_.json')).done(function (appmenu_navs, website) {
            website = parseJSON(website[0]);
            _.each(_.keys(website), function (key) {
                var obj = website[key];
                website[key] = obj._Values[user.native];
            });


            var context = { website: website, user: user };
            window.pageContext = context;

            promises = (promises || []).map(function (p) { return p(); });

            $.when.apply($, promises).done(function() {
                console.log("pdone", arguments);
                _.each(arguments, function (a) {
                    _.keys(a).forEach(function (k) {
                        context[k] = a[k];
                    });
                });

                $("#appmenu_navs").html(Handlebars.compile(appmenu_navs[0])(context));
                $("body").html(Handlebars.compile($("body").html())(context));
            });

        });
};

var getHashParam = function (name, defaultVal, parser) {
    var u = new URI();
    if (!!u.fragment()) {
        var uriFragmen = u.fragment(true);
        if (!!uriFragmen)
            return !!parser ? parser(uriFragmen[name]) : uriFragmen[name];
    }
    return defaultVal || null;
};

$(function () {
    $("body").addClass("en t-rtl n-ltr html5 page");
    $("body").attr("id", "country_ae");
});
    

