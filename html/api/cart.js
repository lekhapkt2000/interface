$(document).ready(function () {
    // Get data từ url. Ví dụ google.com?search=abc lấy theo từ khóa: get('search') => 'abc'
    function get(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
    // Truncate text nếu quá dài
    function truncate(source) {
        return source.length > 150 ? source.slice(0, 150 - 1) + "…" : source;
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

    fetch(url, options).then(res => res.json()).then(json => {
        $(json.data.cart_items).each(function (i, v) {
            var product = v.product
            var product_option = v.product_option

            var html = `
            <tr>
							<td>
								<div class="thumb_cart">
									<img src="`+ product.thumbnail_url + `"
										data-src="`+ product.thumbnail_url + `" class="lazy" alt="Image">
								</div>
								<span class="item_cart">`+ truncate(product_option.name) + `</span>
							</td>
							<td>
								<strong>`+ toVND(product_option.price) + `</strong>
							</td>
							<td>
								<div class="numbers-row" id="`+ v.id + `">
									<input type="text" value="`+ v.quantity + `" id="quantity_1" class="qty2" name="quantity_1" readonly="readonly">
									<div class="inc button_inc btn_inc">+</div>
									<div class="dec button_inc btn_dec">-</div>
								</div>
							</td>
							<td>
								<strong>`+ toVND(product_option.price * v.quantity)
                + `</strong>
							</td>
							<td class="options">
								<a href="#remove-item"><i class="ti-trash"></i></a>
							</td>
			</tr>
            `
            $("#cart-list > tbody").append(html)
        });

        //Remove dấu '...' loading
        $("#payment").children().children().eq(0).children().get(0).nextSibling.remove()
        $("#payment").children().children().eq(1).children().get(0).nextSibling.remove()
        $("#payment").children().children().eq(2).children().get(0).nextSibling.remove()

        //Gắn phí ship
        var deliFee = 30000
        if (json.data.subtotal_price > 200000) {
            deliFee = 0
        }
        $("#payment").children().children().eq(0).append(toVND(json.data.subtotal_price))
        $("#payment").children().children().eq(1).append(toVND(deliFee))
        $("#payment").children().children().eq(2).append(toVND(json.data.subtotal_price + deliFee))

        //Update cart
        $(".btn_inc").click(function () {
            var urlItem = 'http://localhost:1323/sale/cart/items/' + $(this).parent().attr('id') + '/add_one'
            var bearer = 'Bearer ' + token;

            const itemOptions = {
                method: 'PUT', //tùy chọn method GET hoặc POST, PUT, DELETE
                headers: {
                    'Authorization': bearer,
                    'Content-Type': 'application/json'
                },
            }

            fetch(urlItem, itemOptions).then(res => {
                if (res.status == 200) {
                    var val = $(this).parent().find("input").val()
                    $(this).parent().find("input").val((parseInt(val, 10) + 1).toString())
                    location.reload()
                }
            });
        });

        $(".btn_dec").click(function () {
            var urlItem1 = 'http://localhost:1323/sale/cart/items/' + $(this).parent().attr('id') + '/remove_one'
            var bearer = 'Bearer ' + token;

            const itemOptions = {
                method: 'PUT', //tùy chọn method GET hoặc POST, PUT, DELETE
                headers: {
                    'Authorization': bearer,
                    'Content-Type': 'application/json'
                },
            }

            fetch(urlItem1, itemOptions).then(res => {
                if (res.status == 200) {
                    var val = $(this).parent().find("input").val()
                    $(this).parent().find("input").val((parseInt(val, 10) - 1).toString())
                    location.reload()
                }
            });
        });

        $('a[href="#remove-item"]').click(function () {
            var itemId = $(this).parent().parent().find("td").eq(2).find("div").attr('id')

            var removeUrl = 'http://localhost:1323/sale/cart/items/' + itemId + '/delete'
            var bearer = 'Bearer ' + token;

            const removeoptions = {
                method: 'DELETE', //tùy chọn method GET hoặc POST, PUT, DELETE
                headers: {
                    'Authorization': bearer,
                    'Content-Type': 'application/json'
                },
            }

            fetch(removeUrl, removeoptions).then(res => {
                if (res.status == 200) {
                    location.reload()
                }
            });
        });
    });
});