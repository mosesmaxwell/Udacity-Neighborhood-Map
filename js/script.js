/**
 * Neighborhood map using google maps apis
 * 
 */

var map;

// Four Square keys
const fsClientID = 'CBGAK1NJGR0DTDQG0WZKANPV2T1OETFYB2UHOLGQ0XY4FD2S';
const fsClientSecret = '0CYDA1ASRTVQUV552QJ3IGL2JINBG3GO3EPJAJLO2HMXXOTT';

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.924617, lng: 80.117489 },
        zoom: 11
    });

    // Location function used for marker.
    var preparePlaces = function (data) {
        var self = this;
        this.title = data.title;
        this.position = data.location;
        this.placeID = data.placeID;
        this.visible = ko.observable(true);

        this.getInfoContent = function () {
            var popularTips = [];
            var FSURL = 'https://api.foursquare.com/v2/venues/' + self.placeID + '/tips?sort=popular&v=20180121&limit=5&client_id=' + fsClientID + '&client_secret=' + fsClientSecret;

            $.getJSON(FSURL,
                function (data) {
                    data.response.tips.items.forEach(function (val, index) {
                        if (val.type === 'user') {
                            let text = '<li class="list-group-item">' + val.text;
                            text += '<br>Tips Given By: ' + val.user.firstName + '</li>';
                            popularTips.push(text);
                        } else {
                            let text = '<li class="list-group-item">' + val.text + '</li>';
                            popularTips.push(text);
                        }
                    });
                }).done(function () {
                    self.tips = '<h5 class="text-uppercase brand-color-title">' + self.title + '</h5>' + '<h5 class="text-uppercase brand-color-subtitle">Popular Tips</h5>';
                    self.tips += '<ul class="list-group list-group-flush">' + popularTips.join('') + '</ul>';
                }).fail(function () {
                    self.tips = '<h5 class="text-uppercase brand-color-title">' + self.title + '</h5><h5 class="text-uppercase text-danger">Error! Something went wrong!</h5>';
                });
        }();

        // Info window details
        this.infowindow = new google.maps.InfoWindow();

        // Marker icon.
        this.defaultIcon = makeMarkerIcon('0091ff');
        this.marker = new google.maps.Marker({
            position: self.position,
            map: map,
            title: self.title,
            icon: self.defaultIcon,
            animation: google.maps.Animation.DROP
        });

        //Display function for marker
        this.showMarker = ko.computed(function () {
            if (this.visible() === true) {
                this.marker.setMap(map);
            } else {
                this.marker.setMap(null);
            }
            return true;
        }, this);

        // Opens the info window for the location marker.
        this.openInfowindow = function () {
            venues.locations.forEach(function (val, index) {
                venues.locations[index].infowindow.close();
            });
            map.panTo(self.marker.getPosition());
            self.infowindow.setContent(self.tips);
            self.infowindow.open(map, self.marker);

            if (self.marker.getAnimation() !== null) {
                self.marker.setAnimation(null);
            } else {
                self.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        };


        // Animate whenever we clicking the marker
        this.bounce = function () {
            google.maps.event.trigger(self.marker, 'click');
        };

        // Assigns a click event for marker
        this.addListener = google.maps.event.addListener(self.marker, 'click', (this.openInfowindow));
    };

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.
    var locations = [
        {
            title: 'Vandalor Zoo',
            location: { lat: 12.884323, lng: 80.088998 },
            placeID: '4c20556ee923ef3bbae84e54'
        },
        {
            title: 'Marina Beach',
            location: { lat: 13.047662, lng: 80.280697 },
            placeID: '4d046ec926adb1f721c3d270'
        },
        {
            title: 'Edward Elliots Beach',
            location: { lat: 13.000506, lng: 80.270840 },
            placeID: '4b5abae4f964a5205cd228e3'
        },
        {
            title: 'Guindy National Park',
            location: { lat: 13.006087, lng: 80.238859 },
            placeID: '4feedb1be4b01127cbc19930'
        },
        {
            title: 'MGM Dizzee World',
            location: { lat: 12.826589, lng: 80.240825 },
            placeID: '4d3fd175cb84b60c2a9680ab'
        }
    ];

    var places = [];
    locations.forEach(function (val, index) {
        places.push(new preparePlaces(val));
    });

    var venues = {
        locations: places,
        query: ko.observable('')
    };

    venues.listedPlaces = ko.computed(function () {
        var self = this;
        return ko.utils.arrayFilter(self.locations, function (location) {
            return location.title.toLowerCase();
        });
    }, venues);

    venues.search = ko.computed(function () {
        var self = this;
        var filter = this.query().toLowerCase();
        if (!filter) {
            self.locations.forEach(function (item) {
                item.visible(true);
            });
            return self.locations;
        } else {
            return ko.utils.arrayFilter(self.locations, function (item) {
                var string = item.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                item.visible(result);
                return result;
            });
        }
    }, venues);

    ko.applyBindings(venues);
}

function makeMarkerIcon(markerColor) {
    return icon = 'http://www.googlemapsmarkers.com/v1/009900/';
}

function mapError() {
    $('#map').html('<span class="text-danger">Error, something went wrong with map</span>');
}

$(document).ready(function () {

    $('#open').click(function () {
        $('#navbarSupportedContent').css("width", "250px");
    });

    $('#close').click(function () {
        $('#navbarSupportedContent').css("width", "0");
    });

});