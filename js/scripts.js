;
$(function(){
    "use strict";

    Function.prototype.bind = function(scope) {
        var fn = this;
        return function() {
            return fn.apply(scope, arguments);
        }
    };

    var YMapRouter = (function($){
        var router = this;

        var $changedInputField,
            ymaps,
            map,
            myPlacemark
            ;

        var suggestItems = function(data) {
            var $container = $('.js-suggest-address-items');
            var $ul = $('.js-suggest-address-items > ul');
            var items = data[1];
            $ul.empty();
            $container.show();
            var $el;
            for (var i = 0, l = items.length; i < l; i++) {
                $el = $('<li>' + items[i][1] + '</li>');
                $el.click(function(){
                    insertAddress($(this).text());
                    $container.hide();
                });
                $ul.append($el);
            }
        };

        var getSuggestAddressData = function(e) {
            var $thisEl = $(this);
            $changedInputField = $thisEl;

            if (e.which == 13) {
                $('.js-suggest-address-items').hide();
                insertAddress($thisEl.val());
                return;
            }

            var url = 'http://suggest-maps.yandex.ru/suggest-geo';
            var data = {
                callback: 'window.suggestDataCallback',
                lang: 'ru-RU',
                search_type: 'all',
                ll: '30.52055093073688,59.95261099684442',
                spn: '1.9294738769531037,0.31615580709414104',
                fullpath: 1,
                v: 5,
                _: 1407312492165,
                part: $thisEl.val()
            };
            var suggestUrl = url + '?' + $.param(data);
            $('body').find('#scriptContainer').empty().append($('<script charset="utf-8" src="' + suggestUrl + '">'));
        };

        var insertAddress = function(data) {
            $changedInputField.val(data);
            var firstPoint, secondPoint;
            if ($changedInputField.hasClass('js-start-input')) {
                firstPoint = $changedInputField.val();
                secondPoint = $('.js-finish-input').val();
            } else {
                firstPoint  = $('.js-start-input').val();
                secondPoint = $changedInputField.val();
            }
            if (firstPoint && secondPoint) {
                buildRoute(firstPoint, secondPoint);
            }
        };

        var buildRoute = function(from, to) {
            router.ymaps.route([from, to]).then(function(route){
                this.map.geoObjects.removeAll();
                this.map.geoObjects.add(route);
                route.editor.start();
                route.editor.events.add('routeupdate', function (e) {
                    calculateDistance(route);
                });
                calculateDistance(route)
            }.bind(router));
        };

        var calculateDistance = function(route) {
            var distance = Math.round(route.getLength() / 1000);
            $('.js-distance').html(distance);
            $('.js-price').html(180 + distance * 25);

            var points = route.getWayPoints(),
                lastPoint = points.getLength() - 1;

            points.get(0).properties.set('iconContent', 'Точка отправления');
            points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');
        };

        var createPlacemark = function(coords) {
            return new router.ymaps.Placemark(coords, {
            }, {
                preset: 'islands#dotIcon',
                iconColor: '#3b5998',
                draggable: true
            });
        };

        var getAddress = function(coords) {
            router.ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                router.myPlacemark.properties
                    .set({
                        balloonContent: firstGeoObject.properties.get('text')
                    });

                $('.js-start-input').val(firstGeoObject.properties.get('name'));
            });
        };

        return {
            initialize: function(ymaps) {
                router.ymaps = ymaps;
                router.map = new router.ymaps.Map('map', {
                    center: [59.918154, 30.305578],
                    zoom: 11,
                    controls: []
                });

                router.map.events.add('click', function (e) {
                    var coords = e.get('coords');
                    if (router.myPlacemark) {
                        router.myPlacemark.geometry.setCoordinates(coords);
                    } else {
                        router.myPlacemark = createPlacemark(coords);
                        router.map.geoObjects.add(router.myPlacemark);
                        router.myPlacemark.events.add('dragend', function () {
                            getAddress(router.myPlacemark.geometry.getCoordinates());
                        }.bind(router));
                    }
                    getAddress(coords);
                });

                $('.js-start-input, .js-finish-input').keyup(getSuggestAddressData);
            },

            suggestDataCallback: function(data) {
                suggestItems(data);
            }
        }
    });


    ymaps.ready(function(){
        var router = new YMapRouter($);
        router.initialize(ymaps);
        window.suggestDataCallback = router.suggestDataCallback;
    });
});



