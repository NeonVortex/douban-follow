// ==UserScript==
// @name         Douban Follow
// @namespace    http://brucezhao.com/
// @version      0.2.4
// @description  Find who did not follow me back!
// @author       Mr. Beitang
// @match        *://www.douban.com/
// @require      http://code.jquery.com/jquery-1.4.4.min.js
// @grant        GM_xmlhttpRequest
// @connect      douban.com
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    let link = $("#friend>p").append("<br/><a href='javascript:void(0)'>> 未关注我的人</a><br/>");
    
    link.click(() => {
        //20180219 B Change selector for future proof
        //let numFollowers = $("#friend > p > a[href$='/contacts/rlist']").text().replace(/[^0-9]/g,"");
        let numFollowers = $("#friend a[href]:contains('被'):contains('人关注')").text().replace(/[^0-9]/g,"");
        let pagesFollowers = Math.ceil(numFollowers/20);

        //20180219 B Change selector for future proof
        //let numFollowings = $("#friend .pl > a[href$='/contacts/list']").text().replace(/[^0-9]/g,"");
        let numFollowings = $("#friend :contains('我的关注') a[href]:contains('成员')").text().replace(/[^0-9]/g,"");
        let pagesFollowings = Math.ceil(numFollowings/20);

        let followers = [], followings = [];

        let checkNotFollowers = () => {
            return followings.filter(function(following){return !followers.some(function(follower){return following.id == follower.id;}); });
        };

        let getLoadingMessageHTML = () => {
            return "<p><span>正在载入 " +
                Math.floor(Number(Number(followers.length) + Number(followings.length)) * 100 / Number(Number(numFollowers) + Number(numFollowings))) +
                "%</span></p>";
        };

        let loading = $(getLoadingMessageHTML()).insertAfter(link);

        let check = () => {
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

        //20180219 B Compatibility for *Monkey and Chrome Extension
        let sendRequest = (url, success, error) => {
            if (typeof GM_xmlhttpRequest != 'undefined' && GM_xmlhttpRequest) {
                GM_xmlhttpRequest({ method: 'GET', url: url, onload: response => {
                    success(response.responseText);
                }, onerror: response => {
                    error(response.responseText);
                }});
            }
            else {
                $.ajax({method: 'GET', url: url, success: success, error: error});
            }
        };


        for (let i = 0; i < pagesFollowers; i++) {
            //20180219 B setTimeout to avoid Douban's abnormality check
            setTimeout(() => sendRequest('https://www.douban.com/contacts/rlist?start='+i*20, data => {
                Array.prototype.push.apply(followers, Array.prototype.map.call($(data).find("ul.user-list>li"), 
                    item => ({id: $(item).attr("id"), html: $(item).find("a[title]")})));
                check();
                }, function(error) {
                    console.log(error);
                }), i*500);
        }

        for (let i = 0; i < pagesFollowings; i++) {
            //20180219 B setTimeout to avoid Douban's abnormality check
            setTimeout(() => sendRequest('https://www.douban.com/contacts/list?start='+i*20, data => {
                Array.prototype.push.apply(followings, Array.prototype.map.call($(data).find("ul.user-list>li"), 
                    item => ({id: $(item).attr("id"), html: $(item).find("a[title]")})));
                check();
                }, function(error) {
                    console.log(error);
                }), i*500);
        }
        
    });

})();
