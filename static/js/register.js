/**
 * 监听表单的提交，但是不需要使用表单默认的提交行为，而是通过ajax来提交
 */
$('form').on('submit', function(e) {

    // 阻止表单的默认提交行为
    e.preventDefault();
    
    // 使用ajax提交请求
    $.ajax({
        method: this.method,
        url: this.action,
        data: {
            username: this.username.value,
            password: this.password.value,
            repassword: this.repassword.value
        }
    }).done( data => {
        // console.log(data);

        if (data.code) {
            $('.message').html(data.message).css('color', 'red');
        } else {
            $('.message').html('注册成功').css('color', 'green');

            setTimeout(() => {
                window.location = '/user/login';
            }, 1000);
        }
    } );

});