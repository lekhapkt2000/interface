$(document).ready(function () {
	function get(name) {
		if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
			return decodeURIComponent(name[1]);
	}
	function truncate(source) {
		return source.length > 40 ? source.slice(0, 40 - 1) + "…" : source;
	}
	function toVND(x) {
		return x.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
	}

	var token = localStorage.getItem('token')

	var page = get('page')
	var categoryId = get('category_id')
	//Url của api
	url = 'http://localhost:1323/products?limit=3&page=1&top_rating=true'
	const options = {
		method: 'GET', //tùy chọn method GET hoặc POST, PUT, DELETE
		headers: { 'Content-Type': 'application/json' },
	}

	/* Quy ước:
		Đọc data dùng GET
		Sửa data dùng PUT
		Thêm data dùng POST
		Xóa data dùng DELETE
	*/

	// Tham khảo
	// https://suntech.edu.vn/http-request-trong-javascript-voi-fetch-api.sunpost.html

	//Gọi api => trả về dạng Json => chạy loop đổ json ra HTML
	fetch(url, options).then(res => res.json()).then(json => {
		for (var i = 0; i < json.data.length; i++) {

			//Hiển thị tên sản phẩm mra HTML
			var obj = json.data[i];
			var newDiv = document.createElement('div');
			newDiv.className = 'col-6 col-md-4'
			newDiv.innerHTML = `
        						<div class="grid_item">
        						
        							<figure>
										<a href="product-detail.html?product_id=` + obj.id + `" product_id="` + obj.id + `">
        									<img class="img-fluid lazy"
        										src="` + obj.thumbnail_url + `"
        										data-src="` + obj.thumbnail_url + `" alt="">
        								</a>
        								<!-- <div data-countdown="2019/05/15" class="countdown"></div> -->
        							</figure>
        							<a href="product-detail-2.html?product_id=` + obj.id + `">
        								<h3>`+ truncate(obj.name) + `</h3>
        							</a>
        							<div class="price_box">
        								<span class="new_price">` + toVND(obj.price) + ` đ</span>
        								<span class="old_price">` + toVND(obj.price + obj.price * 0.2) + ` đ</span>
        							</div>
        							<ul>
        								<li><a href="#add-to-cart" class="tooltip-1" data-toggle="tooltip" data-placement="left"
        										title="Thêm vào giỏ hàng"><i class="ti-shopping-cart"></i><span>Thêm vào giỏ hàng</span></a></li>
        							</ul>
        						</div>     
        `;
			document.getElementById("featured").appendChild(newDiv)
		}

		$('a[href="#add-to-cart"]').click(function () {
			var productId = $(this).parent().parent().parent().find("figure").find("a").attr("product_id")
			var quantity = 1
			var n = $(this).parent().parent().parent().find("a").find("h3").text()
			var g = $(this).parent().parent().parent().parent().find(".price_box").find(".new_price").text()
			var u = $(this).parent().parent().parent().parent().find("figure").find("a").find("img").attr("src")

			//frontend
			$("#cart-menu > ul").append(`
				<li>
				<a href="product-detail.html?product_id=`+ productId + `">
					<figure><img src="`+ u + `"
							data-src="img/products/shoes/1.jpg" alt="" width="50"
							height="50" class="lazy"></figure>
					<strong><span>`+ quantity + `x ` + n + `</span>` + g + `</strong>
				</a>
				<a href="#0" class="action"><i class="ti-trash"></i></a>
				</li>
				`)
			//

			var cartUrl = "http://localhost:1323/add_to_cart"
			var bearer = 'Bearer ' + token;

			const cartOptions = {
				method: 'POST', //tùy chọn method GET hoặc POST, PUT, DELETE
				headers: {
					'Authorization': bearer,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data:
					{
						product_option_id: parseInt(productId),
						quantity: parseInt(quantity),
					}
				})
			};

			var status2
			fetch(cartUrl, cartOptions)
				.then((res) => {
					console.log(res.status);
					status2 = res.status
					return res.json();
				})
				.then(data => {
					if (status2 == 200) {
						$(".cart_bt strong").text(parseInt($(".cart_bt strong").text()) + 1)
					}
					if (status2 != 200) {
					}
					if (status2 == 401) {
					}
				})
				.catch(error => console.log('Error:', error));
		});
	});



});