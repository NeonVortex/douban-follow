(function() {
    'use strict';

    var link = $("#friend>p").append("<br/><a href='javascript:void(0)'>> 未关注我的人</a><br/>");

    link.click(function(){
        //20180219 B Change selector for future proof
        //var numFollowers = $("#friend > p > a[href$='/contacts/rlist']").text().replace(/[^0-9]/g,"");
        var numFollowers = $("#friend a[href]:contains('被'):contains('人关注')").text().replace(/[^0-9]/g,"");
        var pagesFollowers = Math.ceil(numFollowers/20);

        //20180219 B Change selector for future proof
        //var numFollowings = $("#friend .pl > a[href$='/contacts/list']").text().replace(/[^0-9]/g,"");
        var numFollowings = $("#friend :contains('我的关注') a[href]:contains('成员')").text().replace(/[^0-9]/g,"");
        var pagesFollowings = Math.ceil(numFollowings/20);

        var followers = [], followings = [];

        var checkNotFollowers = function() {
            return followings.filter(function(following){return !followers.some(function(follower){return following.id == follower.id;}); });
        };

        var getLoadingMessageHTML = function(){
            return "<p><span>正在载入 " +
                Math.floor(Number(Number(followers.length) + Number(followings.length)) * 100 / Number(Number(numFollowers) + Number(numFollowings))) +
                "%</span></p>";
        };

        var loading = $(getLoadingMessageHTML()).insertAfter(link);

        var check = function() {
            if (followers.length >= numFollowers && followings.length >= numFollowings) {
                loading.html("");
                checkNotFollowers().forEach(function(item){
                    loading.append($("<span>"+item.html.get(0).outerHTML+"</span>"));
                });
                loading.append("<br/>");
            }
            else {
                loading.html(getLoadingMessageHTML());
            }
        };

        var i;
        for (i = 0; i < pagesFollowers; i++) {
            //20180219 B setTimeout to avoid Douban's abnormality check
            var sendFollowerRequest = function(j){
                $.ajax ( {
                    method:     'GET',
                    url:        'https://www.douban.com/contacts/rlist?start='+j*20,
                    success:     function (responseDetails) {
                        Array.prototype.push.apply(followers, $(responseDetails).find("ul.user-list>li").map(function(){
                            var item = $(this);
                            return {id: item.attr("id"), html: item.find("a[title]") };
                        }));
                        check();
                    },
                    error:    function(errorDetails) {
                        console.log(errorDetails);
                    }
                } );
            };

            setTimeout(sendFollowerRequest.bind(undefined, i), i*500);
        }

        for (i = 0; i < pagesFollowings; i++) {
            //20180219 B setTimeout to avoid Douban's abnormality check
            var sendFollowingRequest = function(j){
                $.ajax ( {
                    method:     'GET',
                    url:        'https://www.douban.com/contacts/list?start='+j*20,
                    success:     function (responseDetails) {
                        Array.prototype.push.apply(followings, $(responseDetails).find("ul.user-list>li").map(function(){
                            var item = $(this);
                            return {id: item.attr("id"), html: item.find("a[title]") };
                        }));
                        check();
                    },
                    error:    function(errorDetails) {
                        console.log(errorDetails);
                    }
                } );
            };

            setTimeout(sendFollowingRequest.bind(undefined, i), i*500);
        }

    });

})();
