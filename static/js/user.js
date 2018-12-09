/**
 * 上传头像
 */

// 当用户选择要上传的文件以后，会触发input的change事件
$('.avatarInput').on('change', function() {

    // console.log(this.value);    // value保存的是图片的路径和文件名称，而不是图片的二进制数据

    // 图片的真实数据保存在 files 属性中
    // console.log(this.files);
    // 使用formData对象来构建formData
    let fd = new FormData();
    // 第一个参数是后端接收的key，第二个参数是value
    fd.append('avatar', this.files[0]);

    $.ajax({
        method: 'post',
        url: '/user/avatar',
        // jq默认情况下会把数据处理成 urlencoded 格式，我们不要jq帮助我们自动处理，希望根据数据的格式自动进行构建
        processData: false,
        // jq还会默认把content-type的类型设置成application/x-www-form-urlencoded
        contentType: false,
        data: fd
    }).done( data => {
        if (!data.code) {
            // 上传成功
            // console.log(data);
            $('.avatar').attr('src', '/public/uploads/avatar/' + data.data.url);
        }
    } );

});
$('.avatar').on('click', function() {

    // 点击图片调用fileInput的click，弹出选择文件对话框
    $('.avatarInput').click();

});