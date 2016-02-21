$(function() {

    /*$('.btn-icon-power').button({icons: {primary: "ui-icon-power"}, text: false});
     $('.btn-icon-search').button({icons: {primary: "ui-icon-search"}, text: false});
     $('.btn-icon-contact').button({icons: {primary: "ui-icon-contact"}, text: false});
     $('.btn-icon-note').button({icons: {primary: "ui-icon-note"}, text: false});
     $('.btn-icon-comment').button({icons: {primary: "ui-icon-comment"}, text: false});
     $('.btn-icon-person').button({icons: {primary: "ui-icon-person"}, text: false});
     $('.btn-icon-pencil').button({icons: {primary: "ui-icon-pencil"}, text: false});
     $('.btn-icon-heart').button({icons: {primary: "ui-icon-heart"}, text: false});
     $('.btn-icon-star').button({icons: {primary: "ui-icon-star"}, text: false});
     $('.btn-icon-disk').button({icons: {primary: "ui-icon-disk"}, text: false});
     $('.btn-icon-alert').button({icons: {primary: "ui-icon-alert"}, text: false});
     $('.btn-icon-notice').button({icons: {primary: "ui-icon-notice"}, text: false});
     $('.btn-icon-help').button({icons: {primary: "ui-icon-help"}, text: false});
     $('.btn-icon-info').button({icons: {primary: "ui-icon-info"}, text: false});
     
     $('.btn-icon-arrow-s').button({icons: {primary: "ui-icon-circle-arrow-s"}, text: false});
     $('.btn-icon-arrow-w').button({icons: {primary: "ui-icon-circle-arrow-w"}, text: false});
     $('.btn-icon-arrow-e').button({icons: {primary: "ui-icon-circle-arrow-e"}, text: false});
     $('.btn-icon-arrow-n').button({icons: {primary: "ui-icon-circle-arrow-n"}, text: false});
     
     $('.btn').button();
     
     $('.radio').buttonset();*/

    // when the client clicks SEND
    $('#btn_msg').click(function() {
        var message = $('#chat_msg').val();
        $('#chat_msg').val('');

        $('#chat').prepend('<p><b>Moi</b> : ' + message + '<br />');

        console.log($('#receiver').val());
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', {nickname: $('#receiver').val(), message: message});
    });

    // when the client hits ENTER on their keyboard
    $('#chat_msg').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            $('#btn_msg').focus().click();
            $('#chat_msg').focus();
        }
    });

//$(document).ready(function(){

    if ($("#slider1_container").length > 0) {
        var jssor_slider1 = new $JssorSlider$('slider1_container', {
            $AutoPlay: true,
            $PlayOrientation: 2,
            $SlideDuration: 1000,
            $AutoPlayInterval: 5000,
            $ThumbnailNavigatorOptions: {
                $Class: $JssorThumbnailNavigator$,
                $ChanceToShow: 2
            }
        });
    }

    if ($("#slider1_container_pub1").length > 0) {
        var jssor_slider_pub1 = new $JssorSlider$('slider1_container_pub1', {
            $AutoPlay: true,
            $PlayOrientation: 1,
            $SlideDuration: 250,
            $AutoPlayInterval: 8000,
            $ArrowNavigatorOptions: {
                $Class: $JssorArrowNavigator$,
                $ChanceToShow: 2,
                $AutoCenter: 0,
                $Steps: 1
            }
        });
    }

    if ($("#slider1_container_pub2").length > 0) {
        var jssor_slider_pub2 = new $JssorSlider$('slider1_container_pub2', {
            $AutoPlay: true,
            $SlideDuration: 250,
            $AutoPlayInterval: 8000,
            $ArrowNavigatorOptions: {
                $Class: $JssorArrowNavigator$,
                $ChanceToShow: 2,
                $AutoCenter: 0,
                $Steps: 1
            }
        });
    }

    if ($("#slider1_container_pub3").length > 0) {
        var jssor_slider_pub3 = new $JssorSlider$('slider1_container_pub3', {
            $AutoPlay: true,
            $SlideDuration: 250,
            $AutoPlayInterval: 8000,
            $ArrowNavigatorOptions: {
                $Class: $JssorArrowNavigator$,
                $ChanceToShow: 2,
                $AutoCenter: 0,
                $Steps: 1
            }
        });
    }

    if ($("#slider1_container_pub4").length > 0) {
        var jssor_slider_pub4 = new $JssorSlider$('slider1_container_pub4', {
            $AutoPlay: true,
            $SlideDuration: 250,
            $AutoPlayInterval: 8000,
            $ArrowNavigatorOptions: {//[Optional] Options to specify and enable arrow navigator or not
                $Class: $JssorArrowNavigator$, //[Requried] Class to create arrow navigator instance
                $ChanceToShow: 2, //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 0, //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: 1                                       //[Optional] Steps to go for each navigation request, default value is 1
            }
        });
    }
//});

    /*$('#btn_msg').click(function() {
     socket.emit('sendchat', {message: $('#chat_msg').val()});
     });*/

    $('#btn-find-address').click(function() {
        $.ajax({
            type: 'get',
            url: 'https://maps.googleapis.com/maps/api/geocode/json?language=fr&address=' + $('#input-address').val(),
            success: function(data) {

                if (data.status === "OK") {
                    $('#input-latitude').val(data.results[0].geometry.location.lat);
                    $('#input-longitude').val(data.results[0].geometry.location.lng);

                    if (data.location_type !== 'APPROXIMATE') {
                        $('#div-results').text("Etablissement trouvé avec suffisamment de précision.");
                        var results = data.results[0].address_components;

                        //var streetnumber = findResult(results, "street_number").long_name;
                        //var street = findResult(results, "route").long_name;
                        var city = findResult(results, "locality").long_name;
                        var postalcode = findResult(results, "postal_code").long_name;
                        var dept_number = findResult(results, "administrative_area_level_2").short_name;
                        var department = findResult(results, "administrative_area_level_2").long_name;
                        var state = findResult(results, "administrative_area_level_1").long_name;
                        var country = findResult(results, "country").long_name;

                        $('#input-formatted-address').val(data.results[0].formatted_address);
                        $('#input-city').val(city);
                        $('#input-postalcode').val(postalcode);
                        $('#input-state').val(state);
                        $('#input-deptnumber').val(dept_number);
                        $('#input-department').val(department);
                        $('#input-state').val(state);
                        $('#input-country').val(country);

                    } else {
                        $('#div-results').text("Recherche approximative. Merci d'affiner votre recherche.");
                    }

                    var mapOptions = {
                        zoom: 16,
                        center: new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
                    };

                    var map = new google.maps.Map(document.getElementById('map-canvas'),
                            mapOptions);
                }
            }
        }
        );
    });

    $('#link-pub-left, #link-pub-right').magnificPopup({
        type: 'inline',
        preloader: false,
        // When elemened is focused, some mobile browsers in some cases zoom in
        // It looks not nice, so we disable it:
        callbacks: {
            beforeOpen: function() {
                if ($(window).width() < 700) {
                    this.st.focus = false;
                } else {
                    this.st.focus = '#name';
                }
            }
        }
    });

    $('#btn-add-prospect').click(function() {

        if (true === confirm($('#confirm-add-prospect-msg').html())) {
            $('#add-prospect-form').submit();
        }
    });

    $('.add-all').on("click", function() {
        $('#results').find('tr').each(function() {
            $(this).click();
        });
    });

    $('#select-range').on('change', function() {
        console.log('ici');
        console.log($(this).val());
        if (parseInt($(this).val()) > 0) {
            $('#form-search-nearby').submit();
        }
    });


});