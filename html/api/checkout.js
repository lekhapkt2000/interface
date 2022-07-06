$(document).ready(function () {
    // Get data từ url. Ví dụ google.com?search=abc lấy theo từ khóa: get('search') => 'abc'
    function get(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
    // Truncate text nếu quá dài
    function truncate(source) {
        return source.length > 27 ? source.slice(0, 27 - 1) + "…" : source;
    }
    // Convert từ số sang hiển thị dạng VND
    function toVND(x) {
        return x.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    }

    var token = localStorage.getItem('token')

    var url = 'http://localhost:1323/sale/carts'
    var bearer = 'Bearer ' + token;

    const options = {
        method: 'GET', //tùy chọn method GET hoặc POST, PUT, DELETE
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
    }
    var S = 0
    fetch(url, options).then(res => res.json()).then(json => {
        $(json.data.cart_items).each(function (i, v) {

            var product = v.product
            var product_option = v.product_option

            var html = `
            <li class="clearfix"><em>`+ v.quantity + `x ` + truncate(product_option.name) + `</em> <span>` + toVND(product_option.price) + `</span></li>
            `

            var discounts = 0
            var delivery_fee = 30000
            if (json.data.subtotal_price > 200000) {
                delivery_fee = 0
            }
            var subtotal_price = json.data.subtotal_price
            var total_price = json.data.subtotal_price + delivery_fee - discounts
            S = total_price

            $("#order-summary > ul").eq(0).append(html)
            $("#order-summary").children().eq(1).find("li").eq(0).find("span").text(toVND(subtotal_price))
            $("#order-summary").children().eq(1).find("li").eq(1).find("span").text(toVND(delivery_fee))
            $("#order-summary").children().eq(1).find("li").eq(2).find("span").text(toVND(discounts))
            $("#order-summary > div").eq(0).find("span").text(toVND(total_price))

        });

        if (json.data.cart_items.length == 0) {
            $("#checkout-info").html("<h4>Bạn chưa có sản phẩm nào trong giỏ hàng</h4>")
        }

        //Xử lí đặt hàng
        $('a[href="#confirm"]').click(function () {

            //Tạo đơn hàng
            var orderUrl = 'http://localhost:1323/sale/orders/create'
            var bearer = 'Bearer ' + token;
            var payment_method = $('input[name="payment"]:checked').val();
            var payment_method_id
            var order_id
            var discounts = 5000
            var delivery_fee = 30000

            var email_notify = false
            if ($("#mailer").prop("checked") == true) {
                email_notify = true
            }

            //Xử lí thanh toán cod
            if (payment_method == "cod") {
                payment_method_id = 1
            }

            //Xử lí thanh toán MoMo
            if (payment_method == "momo") {
                payment_method_id = 2
            }

            const orderOptions = {
                method: 'POST', //tùy chọn method GET hoặc POST, PUT, DELETE
                headers: {
                    'Authorization': bearer,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data:
                    {
                        email_notify: email_notify,
                        total_price: S,
                        total_discounts: discounts,
                        delivery_fee: delivery_fee,
                        payment_method_id: payment_method_id,
                    }
                })
            }

            var host = window.location.host;
            var status
            fetch(orderUrl, orderOptions)
                .then((res) => {
                    console.log(res.status);
                    status = res.status
                    return res.json();
                })
                .then(data => {
                    if (status == 200) {
                        order_id = data.data.id

                        var sum = 0
                        //Thêm các items cho đơn hàng
                        $(json.data.cart_items).each(function (i, v) {
                            var product = v.product
                            var product_option = v.product_option

                            var itemUrl = 'http://localhost:1323/sale/order/items/create'
                            var bearer = 'Bearer ' + token;

                            const itemOptions = {
                                method: 'POST', //tùy chọn method GET hoặc POST, PUT, DELETE
                                headers: {
                                    'Authorization': bearer,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    data:
                                    {
                                        product_id: product.id,
                                        product_option_id: product_option.id,
                                        order_id: order_id,
                                        quantity: v.quantity,
                                    }
                                })
                            }

                            var status1
                            fetch(itemUrl, itemOptions)
                                .then((res) => {
                                    console.log(res.status);
                                    status1 = res.status
                                    return res.json();
                                })
                                .then(data => {
                                    if (status1 == 200) {
                                        sum += product_option.price

                                        //Sau khi insert item cuối cùng trong giỏ
                                        if (i == json.data.cart_items.length - 1) {

                                            if (payment_method_id == 1) {
                                                window.location.href = '/html/confirm.html'; //Chuyển hướng đến trang confirm
                                            }

                                            if (payment_method_id == 2) {
                                                sum = sum + delivery_fee - discounts

                                                var momoUrl = 'http://localhost:1323/sale/orders/momo_payment'

                                                const momoOptions = {
                                                    method: 'POST', //tùy chọn method GET hoặc POST, PUT, DELETE
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        data:
                                                        {
                                                            host_name: host,
                                                            amount: sum.toString(),
                                                        }
                                                    })
                                                }
                                                var momoStatus
                                                fetch(momoUrl, momoOptions).then(res => res.text()).then(text => {
                                                    console.log(text)
                                                    window.location.href = text
                                                });
                                            }
                                        }

                                    }
                                    if (status1 != 200) {
                                        $('#order-summary').append(' <span style="color:red"> [Lỗi - Có lỗi xảy ra khi đặt hàng!]</span>')
                                    }
                                })
                                .catch(error => console.log('Error:', error));
                        });

                        // window.location.href = '/html/confirm.html'; //Chuyển hướng đến trang confirm
                    }
                    if (status != 200) {
                        $('#order-summary').append(' <span style="color:red"> [Lỗi - Có lỗi xảy ra khi đặt hàng!]</span>')
                    }
                })
                .catch(error => console.log('Error:', error));


        });
    });
});