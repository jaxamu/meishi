/**
 * 修改个人基本资料
 */
$('.profile_form').on('submit', function(e) {

    e.preventDefault();
    
    $.ajax({
        method: this.method,
        url: this.action,
        data: {
            mobile: this.mobile.value,
            email: this.email.value,
            realname: this.realname.value,
            gender: this.gender.value,
            year: this.year.value,
            month: this.month.value,
            date: this.date.value
        }
    }).done(data => {
        if (data.code) {
            $('.message').html(data.message).css('color', 'red');
        } else {
            $('.message').html('修改成功').css('color', 'green');
            setTimeout(() => {
                // window.location.reload();
                $('.message').html('')
            }, 500);
        }
    });

});