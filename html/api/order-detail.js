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

    var orderId = get('order_id')

    url = 'http://localhost:1323/sale/orders/' + orderId
    var bearer = 'Bearer ' + token;

    const options = {
        method: 'GET', //tùy chọn method GET hoặc POST, PUT, DELETE
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
    }

    fetch(url, options).then(res => res.json()).then(json => {
        $("#order-id > h6").text("Mã đơn hàng: " + json.data.id)
        $("#order-info").find("div").eq(0).find('br').after(json.data.created_at)
        $("#order-info").find("div").eq(1).find('br').after(json.data.shipping_address.specific_address)
        $("#order-info").find("div").eq(2).find('br').after(json.data.status)
        $("#order-info").find("div").eq(3).find('br').after(toVND(json.data.total_price))

        switch (json.data.status) {
            case "pending":
                $(".track > div").eq(0).addClass("active")
                break;
            case "approved":
                $(".track > div").eq(0).addClass("active")
                $(".track > div").eq(1).addClass("active")
                break;
            case "shipping":
                $(".track > div").eq(0).addClass("active")
                $(".track > div").eq(1).addClass("active")
                $(".track > div").eq(2).addClass("active")
                break;
            case "delivered":
                $(".track > div").eq(0).addClass("active")
                $(".track > div").eq(1).addClass("active")
                $(".track > div").eq(2).addClass("active")
                $(".track > div").eq(3).addClass("active")
                break;
        }

        $(json.data.order_items).each(function (i, v) {
            var html = `
            <div class="card grid_item"  style="margin-right: 84px;">
            <figure>
                <a href="product-detail.html?product_id=`+ v.product_option.id + `" product_id="124742926">
                <img class="img-fluid lazy" src="`+ v.product.thumbnail_url + `" alt="">
                </a>
                <!-- <div data-countdown="2019/05/15" class="countdown"></div> -->
            </figure>
            <a href="product-detail.html?product_id=`+ v.product_option.id + `">
                <h3>`+ truncate(v.product_option.name) + `</h3>
            </a>
            <div class="price_box">
                <span class="new_price">`+ toVND(v.product_option.price) + `</span>
            </div>
            </div>
            `
            $("#order-items").append(html)
        });
    });
});