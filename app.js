
sortHabr = function() {
    var instance = this;

    var list = null;

    var ratingList = null;

    var sortDirection = 1;

    var scrolling = true;

    var scrollEventCallback = null;

    var observers = [];

    const waitTimeOut = 2000;

    const idSortPopup = 'ext_habr_comment_popup';

    this.init = function() {
        // remove old sort popup if exist
        instance.removeSortPopup();

        // event change content
        var mainContent = document.querySelector('.tm-layout__container');
        if (mainContent) {
            // wait onload page data
            setTimeout(function () {
                var observer = new MutationObserver(function() {
                    setTimeout(function () {instance.init()}, waitTimeOut);
                });
                observer.observe(mainContent, {childList: true});
                observers.push(observer);
            }, waitTimeOut);
        }

        // event update comments
        var blockComments = document.querySelector('.tm-article-blocks__comments');
        if (blockComments) {
            // wait onload page data
            setTimeout(function () {
                var observer = new MutationObserver(function() {
                    setTimeout(function () {instance.init()}, waitTimeOut);
                });
                observer.observe(blockComments, {childList: true, subtree: true});
                observers.push(observer);
            }, waitTimeOut);
        }

        // init list comments
        list = document.querySelector('.tm-comments__tree');
        if (list == null) {
            console.log("tm-comments__tree element not found");
            return;
        }

        // init popup
        var popup = document.createElement('div');
        popup.setAttribute('id', idSortPopup);
        document.body.appendChild(popup);

        // init sort button
        var buttonSort = document.createElement('button');
        buttonSort.setAttribute('id', 'ext_habr_comment_sort_button');
        buttonSort.innerHTML = 'Sort root comments';
        buttonSort.addEventListener('click', sortRoot);
        popup.appendChild(buttonSort);

        // init rating list
        ratingList = document.createElement('div');
        ratingList.setAttribute('id', 'ext_habr_comment_rating_list');
        popup.appendChild(ratingList);

        instance.renderRatingList(list.childNodes);

        // listener scroll
        scrollEventCallback = function(e) {
            if (scrolling) {
                scrolling = false;
                instance.activeVisibleComment();
                scrolling = true;
            }
        };
        window.addEventListener('scroll', scrollEventCallback);
    };

    this.removeSortPopup = function () {
        var popup = document.getElementById(idSortPopup);
        if (popup) {
            popup.remove();
        }
        window.removeEventListener('scroll', scrollEventCallback);

        for (let i = 0; i < observers.length; i++) {
            observers[i].disconnect();
        }
    };

    this.renderRatingList = function(items, prefix = '') {
        if (prefix === '') {
            ratingList.innerHTML = '';
        }

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var rating = instance.getRating(item);
            var commentId = instance.getCommentId(item);

            var ratingElement = document.createElement('div');
            ratingElement.setAttribute('class', 'ext_habr_comment_rating_link');
            ratingElement.setAttribute('id', 'ext_habr_comment_' + commentId);
            ratingElement.innerHTML = prefix + '<a href="#">' + rating + '</a>';
            ratingElement.addEventListener('click', instance.scrollToComment(item));
            ratingList.appendChild(ratingElement);

            for (var k = 0; k < item.childNodes.length; k++) {
                if (item.childNodes[k].className === 'tm-comment-thread__children') {
                    instance.renderRatingList(item.childNodes[k].childNodes, prefix + '*');
                }
            }
        }
    };

    this.scrollToComment = function(item) {
        return (e) => {
            e.preventDefault();

            let position = item.getBoundingClientRect();
            window.scrollTo(position.left, position.top + window.scrollY - instance.getHeaderHeight());
        }
    };

    this.sortRoot = function() {
        var items = list.childNodes;
        var itemsArr = [];
        for (var i in items) {
            if (items[i].nodeType === 1) { // get rid of the whitespace text nodes
                itemsArr.push(items[i]);
            }
        }

        itemsArr.sort(function(a, b) {
            return (instance.getRating(a) > instance.getRating(b) ? (-1 * sortDirection) : (sortDirection));
        });

        for (i = 0; i < itemsArr.length; ++i) {
            list.appendChild(itemsArr[i]);
        }

        sortDirection = sortDirection * -1;

        instance.renderRatingList(list.childNodes);
    };

    this.getRating = function(item) {
        for (var i = 0; i < item.childNodes.length; i++) {
            if (item.childNodes[i].className === 'tm-comment-thread__comment') {
                var ratings = item.childNodes[i].querySelector('.tm-votes-meter__value_rating');
                if (ratings == null) {
                    return 0;
                }

                return parseInt(ratings.textContent)
            }
        }

        return 0;
    }

    this.getCommentId = function(item) {
        for (var i = 0; i < item.childNodes.length; i++) {
            if (item.childNodes[i].className === 'tm-comment-thread__comment') {
                var target = item.childNodes[i].querySelector('.tm-comment-thread__target');
                if (target == null) {
                    return '';
                }

                var id = target.getAttribute('name');
                id = id.split('_');
                return id[id.length - 1];
            }
        }

        return '';
    }

    this.activeVisibleComment = function () {
        var activeLinks = document.querySelectorAll('.ext_habr_comment_rating_link.active');
        for (var k = 0; k < activeLinks.length; k++) {
            activeLinks[k].classList.remove("active");
        }

        var item = instance.getFirstVisibleComment();
        if (item) {
            var link = document.getElementById('ext_habr_comment_' + instance.getCommentId(item));
            link.classList.add("active");
            link.scrollIntoView();
        }
    };

    this.getFirstVisibleComment = function() {
        var items = document.getElementsByClassName('tm-comment-thread__comment');
        for (var i = 0; i < items.length; i++) {
            if (instance.checkVisible(items[i])) {
                return items[i].parentNode;
            }
        }

        return null;
    };

    this.checkVisible = function(item) {
        var rect = item.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom - instance.getHeaderHeight() < 0 || rect.top - viewHeight - instance.getHeaderHeight() >= 0);
    }

    this.getHeaderHeight = function () {
        var header = document.querySelector('.tm-base-layout__header');
        if (header == null) {
            return;
        }
        return header.offsetHeight;
    };

    this.init();

    return this;
}

var sortHabr = sortHabr();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "start" ) {
            console.log("start init sort");
            sortHabr.init();
        }
    }
);
