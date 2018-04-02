// ==UserScript==
// @name         Douban Follow
// @namespace    http://brucezhao.com/
// @version      0.2.5
// @description  Find who did not follow me back!
// @author       Mr. Beitang
// @match        *://www.douban.com/
// @require      http://code.jquery.com/jquery-1.4.4.min.js
// @require      https://unpkg.com/axios/dist/axios.min.js
// @grant        none
// @connect      douban.com
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    const link = $("#friend>p").append("<br/><a href='javascript:void(0)'>> 未关注我的人</a><br/>");

    let isLoading = false;
    let loading = null;
    
    link.click(() => {

        /* const getUserId = callback => {
            let userId = window.crt_uid;
            if (typeof userId != 'undefined' && userId) {
                callback(userId);
            }
            else {
                axios.get('/mine/')
                    .then(resp => callback(resp.request.responseURL.match(/\/people\/(.+?)\//)[1]))
                    .catch(resp => showError(resp));
            }
        };

        getUserId(userId => console.log(userId));
        return;
        */

        if (isLoading) {
            return;
        }
        else {
            isLoading = true;
            loading && loading.remove();
            loading = $('<p><span>正在载入</span></p>').insertAfter(link);
        }

        const numFollowers = $("#friend a[href]:contains('被'):contains('人关注')").text().replace(/[^0-9]/g,"");
        const pagesFollowers = Math.ceil(numFollowers/20);

        const numFollowings = $("#friend :contains('我的关注') a[href]:contains('成员')").text().replace(/[^0-9]/g,"");
        const pagesFollowings = Math.ceil(numFollowings/20);

        const followers = [], followings = [];

 
        const getProgressPercentage = () => 
            Math.floor(Number(Number(followers.length) + Number(followings.length)) * 100 / Number(Number(numFollowers) + Number(numFollowings)));
        
      
        const getNoneFollowers = () => 
            followings.filter(function(following){return !followers.some(function(follower){return following.id == follower.id;}); });


        //progress event handler
        const progressevent = (onprogress, onsuccess) => {
            if (followers.length >= numFollowers && followings.length >= numFollowings) {
                onsuccess(getNoneFollowers());
            }
            else {
                onprogress(getProgressPercentage());
            }
        };

        const showProgress = progress => {
            loading.html("<p><span>正在载入 " + progress + '%</span></p>');
        };

        const showResult = result => {
            loading.html("");
            result.forEach(function(item){
                loading.append($("<span>"+item.html.get(0).outerHTML+"</span>"));
            });
            loading.append("<br/>");
        };

        const showError = error => {
            console.log(error);
            $('<p><span>载入失败</span></p>').insertAfter(loading);
        };


        const sendRequest = (url, success, error) => axios.get(url).then(resp=>success(resp.data)).catch(resp=>error(resp));

        const contacts = {followers: {pages: pagesFollowers, pageSize: 20, urlPrefix: 'https://www.douban.com/contacts/rlist?start=', elSel: 'ul.user-list>li'},
                          followings: {pages: pagesFollowings, pageSize: 20, urlPrefix: 'https://www.douban.com/contacts/list?start=', elSel: 'ul.user-list>li'}};

        for (let key in contacts) {
            for (let i = 0; i < contacts[key].pages; i++) {
                setTimeout(() => axios.get(contacts[key].urlPrefix + i * contacts[key].pageSize).then(resp => {
                    Array.prototype.push.apply(key == 'followers' ? followers : followings, Array.prototype.map.call($(resp.data).find(contacts[key].elSel), 
                        item => ({id: $(item).attr("id"), html: $(item).find("a[title]")})));
                    progressevent(progress => {
                        showProgress(progress);
                    }, result => {
                        showResult(result); 
                        isLoading = false;
                    });
                    }).catch(error => {
                        //TODO clearTimeOut for all jobs when one failed
                        showError(error);
                    }), i*500);
            }
        }
    });

})();
