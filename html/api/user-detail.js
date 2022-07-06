$(document).ready(function () {
    // Get data từ url. Ví dụ google.com?search=abc lấy theo từ khóa: get('search') => 'abc'
    function get(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
    // Truncate text nếu quá dài
    function truncate(source) {
        return source.length > 30 ? source.slice(0, 30 - 1) + "…" : source;
    }
    // Convert từ số sang hiển thị dạng VND
    function toVND(x) {
        return x.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    }

    var token = localStorage.getItem('token')

    var url = 'http://localhost:1323/users/profile'
    var bearer = 'Bearer ' + token;

    const options = {
        method: 'GET', //tùy chọn method GET hoặc POST, PUT, DELETE
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
    }

    fetch(url, options).then(res => res.json()).then(json => {
        $(".profile-img > img").attr("src", json.data.avatar)
        $(".profile-head > h5").text(json.data.name)
        $(".profile-head > h6").text(json.data.email)
        $("#name").val(json.data.name)
        $("#phone").val(json.data.phone_number)
        $("#email").val(json.data.email)
        $("#birth").val(json.data.birthday.slice(0, 10))
    });

    $(".btn-save").click(function () {
        var name = $("#name").val()
        var phone = $("#phone").val()
        var email = $("#email").val()
        var birth = "1999-01-01"
        var avatar = $(".profile-img > img").attr("src")
        var gender = "male"

        var profileUrl = 'http://localhost:1323/users/update'

        const profileOptions = {
            method: 'PUT', //tùy chọn method GET hoặc POST, PUT, DELETE
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data:
                {
                    name: name,
                    avatar: avatar,
                    email: email,
                    gender: gender,
                    phone_number: phone,
                    birthday: birth
                }
            })
        }

        var status
        fetch(profileUrl, profileOptions)
            .then((res) => {
                console.log(res.status);
                status = res.status
                return res.json();
            })
            .then(data => {
                if (status == 200) {
                    window.location.reload()
                }
            })
            .catch(error => console.log('Error:', error));

    });

    $(".btn-change-pass").click(function () {
        var oldPass = $("#old-pass").val()
        var newPass = $("#new-pass").val()
        var confirmPass = $("#confirm-pass").val()

        var passUrl = 'http://localhost:1323/users/change_password'

        const passOptions = {
            method: 'PUT', //tùy chọn method GET hoặc POST, PUT, DELETE
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data:
                {
                    password: oldPass,
                    new_password: newPass
                }
            })
        }

        if (oldPass != "" && newPass != "" && confirmPass != "") {
            if (confirmPass == newPass) {
                var status
                fetch(passUrl, passOptions)
                    .then((res) => {
                        console.log(res.status);
                        status = res.status
                        return res.json();
                    })
                    .then(data => {
                        if (status == 200) {
                            $('#status').html(' <span style="color:green"> [Đổi mật khẩu thành công!]</span>')
                            setTimeout(function () {
                                $('#status').html('')
                            }, 1000);
                        }
                        if (status != 200) {
                            $('#status').html(' <span style="color:red"> [Có lỗi xảy ra!]</span>')
                            setTimeout(function () {
                                $('#status').html('')
                            }, 1000);
                        }
                    })
                    .catch(error => console.log('Error:', error));
            } else {
                $('#status').html(' <span style="color:red"> [Xác nhận mật khẩu không chính xác!]</span>')
                setTimeout(function () {
                    $('#status').html('')
                }, 1000);
            }
        } else {
            $('#status').html(' <span style="color:red"> [Xin điền đầy đủ thông tin!]</span>')
            setTimeout(function () {
                $('#status').html('')
            }, 1000);
        }


    });
});