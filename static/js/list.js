/**
 * 加载更多
 */
let page = 1;
$('.more').on('click', function() {

    // console.log(window.location.pathname);

    page++;
    $.ajax({
        method: 'get',
        url: window.location.pathname + '?page=' + page
    }).done(data => {
        // console.log(data);
        if (data.cookbooks.length) {
            // 有数据
            data.cookbooks.forEach( cookbook => {
                $('<li>').html(`
                    <div class="list_img">
                        <img src="/public/uploads/cookbooks/${cookbook.covers[0]}" />
                    </div>
                    <div class="content_txt">
                        <h3>
                            <a href="/view/${cookbook.id}">${cookbook.name}</a>
                        </h3>
                        <span>${cookbook.user.username}</span>
                        <p class="raw_material">原料：${cookbook.ingredients.join('、')}。</p>
                        <p class="describe">
                            ${cookbook.description}
                        </p>
                        <p class="comment">
                            <span class="love">${cookbook.favoriteCount}</span>
                            <span class="msg">${cookbook.commentCount}</span>
                        </p>
                    </div>
                `).appendTo($('.content_list'));
            } );

            if (!data.isMore) {
                // 没有更多的数据了
                $('.more').hide();
                $('.more').off('click');
            }
        }
    })

});