function findResult(results, name) {
    var result = _.find(results, function(obj) {
        return obj.types[0] == name;//&& obj.types[1] == "political";
    });
    return result ? result : null; // {long_name, short_name}
}
;

/* for user call */
function successGetCurrentPositionCallback(pos) {
    //alert("Latitude : " + position.coords.latitude + ", longitude : " + position.coords.longitude);
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

    var foundLocation = function(city, state, country, postalcode, lat, lon) {
        return arguments;
    };

    //reverse geocode the coordinates, returning location information.
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        var result = results[0];

        /*if (result.geometry.location.location_type != 'ROOFTOP'){
         console.log('not so precise');
         console.log(results);
         }*/

        if (status == google.maps.GeocoderStatus.OK && results.length) {
            //if (status == google.maps.GeocoderLocationType.ROOFTOP && results.length) {
            //console.log(results);

            var results = result.address_components,
                    city = findResult(results, "locality").long_name,
                    state = findResult(results, "administrative_area_level_1").long_name,
                    dept_number = findResult(results, "administrative_area_level_2").short_name,
                    country = findResult(results, "country").long_name,
                    postalcode = findResult(results, "postal_code").long_name;

            //foundLocation(city, state, dept_number, country, postalcode, pos.coords.latitude, pos.coords.longitude);

            var loc = {
                location: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    country: country,
                    state: state,
                    city: city,
                    postalcode: postalcode
                }
            };

            $('#subscribe-form').find('.longitude').val(pos.coords.longitude);
            $('#subscribe-form').find('.latitude').val(pos.coords.latitude);
            $('#subscribe-form').find('.city').val(loc.location.city);
            $('#subscribe-form').find('.state').val(loc.location.state);
            $('#subscribe-form').find('.postalcode').val(loc.location.postalcode);
            $('#subscribe-form').find('.country').val(loc.location.country);
            $("#location").html(loc.location.city + ', ' + loc.location.country);

            if (0 === $("#location").length) {
                $.post('/user/update-location', loc)
                        .done(function(data) {
                            console.log('géolocalisation mise à jour');
                        });
            }
        } else {
            //foundLocation(null, null, null, null, pos.coords.latitude, pos.coords.longitude);
            var loc = {
                location: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    country: null,
                    state: null,
                    city: null,
                    postalcode: null
                }
            };
            $.post('/user/update-location', loc)
                    .done(function(data) {
                        console.log('géolocalisation mise à jour');
                    });
        }
    });
}

/* for admin call */
function successGetCurrentPositionAdminCallback(pos) {
    $('.geolocation-info').hide();

    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

    var foundLocation = function(city, state, country, postalcode, lat, lon) {
        return arguments;
    };

    //reverse geocode the coordinates, returning location information.
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        var result = results[0];

        /*if (result.geometry.location.location_type != 'ROOFTOP'){
         console.log('not so precise');
         console.log(results);
         }*/

        if (status == google.maps.GeocoderStatus.OK && results.length) {
            //if (status == google.maps.GeocoderLocationType.ROOFTOP && results.length) {
            //console.log(results);

            var results = result.address_components,
                    city = findResult(results, "locality").long_name,
                    state = findResult(results, "administrative_area_level_1").long_name,
                    dept_number = findResult(results, "administrative_area_level_2").short_name,
                    country = findResult(results, "country").long_name,
                    postalcode = findResult(results, "postal_code").long_name;

            //foundLocation(city, state, dept_number, country, postalcode, pos.coords.latitude, pos.coords.longitude);

            var loc = {
                location: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    country: country,
                    state: state,
                    city: city,
                    postalcode: postalcode
                }
            };

            $('#longitude').val(pos.coords.longitude);
            $('#latitude').val(pos.coords.latitude);
        } else {
            //foundLocation(null, null, null, null, pos.coords.latitude, pos.coords.longitude);
            var loc = {
                location: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    country: null,
                    state: null,
                    city: null,
                    postalcode: null
                }
            };
            $.post('/admin/update-location', loc)
                    .done(function(data) {
                        console.log('géolocalisation mise à jour');
                    });
        }
    });
}


function errorGetCurrentPositionCallback(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            //alert("L'utilisateur n'a pas autorisé l'accès à sa position");
            /*alert("L'autorisation à l'accès à votre position est requise "+
             "\npour avoir accès à l'ensemble des services nice2meet2.");*/
            $('#login-form').hide();
            $('#subscribe-form').hide();
            $('.geolocation-info').show();
            break;
        case error.POSITION_UNAVAILABLE:
            //alert("L'emplacement de l'utilisateur n'a pas pu être déterminé");
            $('#login-form').hide();
            $('#subscribe-form').hide();
            $('.geolocation-info').show();
            break;
        case error.TIMEOUT:
            //alert("Le service n'a pas répondu à temps");
            $('#login-form').hide();
            $('#subscribe-form').hide();
            $('.geolocation-info').show();
            break;
    }
}

var map, places, iw;
var markers = [];
var searchTimeout;
var centerMarker;
var autocomplete;
var hostnameRegexp = new RegExp('^https?://.+?/');

function initialize() {
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(43.94931700000001, 4.805528),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

    places = new google.maps.places.PlacesService(map);
    google.maps.event.addListener(map, 'tilesloaded', tilesLoaded);

    document.getElementById('keyword').onkeyup = function(e) {
        if (!e)
            var e = window.event;
        if (e.keyCode != 13)
            return;
        document.getElementById('keyword').blur();
        search(document.getElementById('keyword').value);
    };

    var typeSelect = document.getElementById('type');
    typeSelect.onchange = function() {
        search();
    };

    /*var rankBySelect = document.getElementById('rankBy');
     rankBySelect.onchange = function() {
     search();
     };*/
    //search('restaurant', 'restaurant', 'distance');
}

function tilesLoaded() {
    search();
    google.maps.event.clearListeners(map, 'tilesloaded');
    //google.maps.event.addListener(map, 'zoom_changed', searchIfRankByProminence);
    google.maps.event.addListener(map, 'dragend', search);
}

function searchIfRankByProminence() {
    if (document.getElementById('rankBy').value == 'prominence') {
        search();
    }
}

function search() {
    clearResults();
    clearMarkers();

    if (searchTimeout) {
        window.clearTimeout(searchTimeout);
    }
    searchTimeout = window.setTimeout(reallyDoSearch, 500);
}

function reallyDoSearch() {
    var type = document.getElementById('type').value;
    var keyword = document.getElementById('keyword').value;
    var rankBy = 'distance';

    var search = {};

    if (keyword) {
        search.keyword = keyword;
    }

    if (type != 'establishment') {
        search.types = [type];
    }

    if (rankBy == 'distance' && (search.types || search.keyword)) {
        search.rankBy = google.maps.places.RankBy.DISTANCE;
        search.location = map.getCenter();
        centerMarker = new google.maps.Marker({
            position: search.location,
            animation: google.maps.Animation.DROP,
            map: map
        });
    } else {
        search.bounds = map.getBounds();
    }

    places.search(search, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var icon = '';
                'icons/number_' + (i + 1) + '.png';
                markers.push(new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: icon
                }));
                google.maps.event.addListener(markers[i], 'click', getDetails(results[i], i));
                window.setTimeout(dropMarker(i), i * 100);
                addResult(results[i], i);
            }
        }
    });
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    if (centerMarker) {
        centerMarker.setMap(null);
    }
}

function dropMarker(i) {
    return function() {
        if (markers[i]) {
            markers[i].setMap(map);
        }
    };
}

function addResult(result, i) {
    var results = document.getElementById('results');
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 == 0 ? '#F0F0F0' : '#FFFFFF');
    tr.onclick = function() {
        google.maps.event.trigger(markers[i], 'click');
    };

    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var icon = document.createElement('img');
    icon.src = '';//'icons/number_' + (i + 1) + '.png';
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    var name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
}

function clearResults() {
    var results = document.getElementById('results');
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

function getDetails(result, i) {
    return function() {
        places.getDetails({
            reference: result.reference
        }, showInfoWindow(i));
    };
}

function showInfoWindow(i) {
    return function(place, status) {
        if (iw) {
            iw.close();
            iw = null;
        }

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            iw = new google.maps.InfoWindow({
                content: getIWContent(place)
            });
            iw.open(map, markers[i]);
        }
    };
}

function getIWContent(place) {

    insertPlaceIntoDB(place);

    var content = '';
    content += '<table>';
    content += '<tr class="iw_table_row">';
    content += '<td style="text-align: right"><img class="hotelIcon" src="' + place.icon + '"/></td>';
    //content += '<td style="text-align: right"><img class="hotelIcon"/></td>';
    content += '<td><b><a href="' + place.url + '">' + place.name + '</a></b></td></tr>';
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Address:</td><td>' + place.vicinity + '</td></tr>';
    if (place.formatted_phone_number) {
        content += '<tr class="iw_table_row"><td class="iw_attribute_name">Telephone:</td><td>' + place.formatted_phone_number + '</td></tr>';
    }
    if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
        }
        content += '<tr class="iw_table_row"><td class="iw_attribute_name">Rating:</td><td><span id="rating">' + ratingHtml + '</span></td></tr>';
    }
    if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website == null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
        }
        content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a href="' + fullUrl + '">' + website + '</a></td></tr>';
    }
    content += '</table>';
    return content;
}

function insertPlaceIntoDB(p) {

    console.log(p);

    var prospect = {
        company: p.name,
        email: '',
        phone: typeof (p.formatted_phone_number) != 'undefined' ? p.formatted_phone_number : '',
        contact: '',
        website: typeof (p.website) != 'undefined' ? p.website : '',
        address: p.formatted_address,
        city: p.address_components[2].long_name,
        postalcode: p.address_components[4].long_name,
        country: p.address_components[3].long_name,
        latitude: parseFloat(p.geometry.location.k),
        longitude: parseFloat(p.geometry.location.B),
        coordinates: [parseFloat(p.geometry.location.B), parseFloat(p.geometry.location.k)],
        types: p.types,
        note: typeof (p.rating) != 'undefined' ? p.rating : 2.5,
        reviews: p.reviews,
        tobecontacteddate: '',
        comment: ''
    };

    $.post('/admin/prospect/add', prospect)
            .done(function() {
                console.log("ajout d'un prospect :");
                console.log(prospect);
            });
}