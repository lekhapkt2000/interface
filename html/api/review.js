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

    var productId = get('product_id')
    var token = localStorage.getItem('token')

    $("#rating-btn").click(function () {
        var starNumber = $('input[name="rating-input"]:checked').val()
        var commend = $("#comment").val()

        var bearer = 'Bearer ' + token;
        const ratingOptions = {
            method: 'POST',
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data:
                {
                    product_id: parseInt(productId),
                    comment: commend.toString(),
                    star_number: parseInt(starNumber)
                }
            })
        };

        var ratingUrl = 'http://localhost:1323/product/ratings/create'
        var status
        fetch(ratingUrl, ratingOptions)
            .then((res) => {
                console.log(res.status);
                window.location.href = '/html/product-detail.html?product_id=' + productId;
                return res.json();
            })
            .then(data => {
                if (status == 200) {
                    window.location.href = '/html/product-detail.html?product_id=' + productId;
                }
            })
            .catch(error => console.log('Error:', error));
    });
});