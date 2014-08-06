$(function(){
    "use strict";

    /* ==========================================================================
     Сегодня в поле Когда
     ========================================================================== */
    var now = new Date();
    var picker = new Pikaday({
        field: $('#date')[0],
        firstDay: 1,
        format: 'DD.MM.YYYY',
        minDate: new Date(moment()),
        maxDate: new Date('2014-12-31'),
        i18n: {
            previousMonth : 'Раньше',
            nextMonth     : 'Позже',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });

    picker.setMoment( moment() );



    /* ==========================================================================
     Яндекс Карты
     ========================================================================== */
    function init() {
        var myMap = new ymaps.Map('map', {
                center: [59.918154, 30.305578],
                zoom: 11,
                controls: []
            }),
            myPlacemark;

//        ymaps.route([
//                'Невский проспект, 12, Санкт-Петербург, Россия',
//                'Кирочная улица, 10, Санкт-Петербург, Россия'
//            ])
//            .then(function(route) {
//                myMap.geoObjects.add(route);
//
//                var distance = Math.round(route.getLength() / 1000);
//                $('.js-distance').html(distance);
//                $('.js-price').html(180 + distance * 25);
//
//                route.editor.start();
//
//                route.editor.events.add('routeupdate', function (e) {
//
//                    var distance = Math.round(route.getLength() / 1000);
//                    $('.js-distance').html(distance);
//                    $('.js-price').html(180 + distance * 25);
//
//                    var points = route.getWayPoints(),
//                        lastPoint = points.getLength() - 1;
//
//                    points.get(0).properties.set('iconContent', 'Точка отправления');
//                    points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');
//
//                    console.log( points.get(0) );
//
//                });
//            });


        // Слушаем клик на карте
        myMap.events.add('click', function (e) {
            var coords = e.get('coords');

            // Если метка уже создана – просто передвигаем ее
            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords);
            }
            // Если нет – создаем.
            else {
                myPlacemark = createPlacemark(coords);
                myMap.geoObjects.add(myPlacemark);
                // Слушаем событие окончания перетаскивания на метке.
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates());
                });
            }
            getAddress(coords);
        });

        // Создание метки
        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                //iconContent: 'поиск...'
            }, {
                preset: 'islands#dotIcon',
                iconColor: '#3b5998',
                draggable: true
            });
        }

        // Определяем адрес по координатам (обратное геокодирование)
        function getAddress(coords) {
            //myPlacemark.properties.set('iconContent', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                myPlacemark.properties
                    .set({
                        //iconContent: firstGeoObject.properties.get('name'),
                        balloonContent: firstGeoObject.properties.get('text')
                    });

                $('.js-start-input').val(firstGeoObject.properties.get('name'));
            });
        }



        /*
         /**
         * Создание мультимаршрута.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml
         *//*
         multiRoute = new ymaps.multiRouter.MultiRoute({
         referencePoints: ["Санкт-Петербург", "Петергоф"]
         }, {
         // Тип промежуточных точек, которые могут быть добавлены при редактировании.
         editorMidPointsType: "via",
         // В режиме добавления новых путевых точек запрещаем ставить точки поверх объектов карты.
         editorDrawOver: false
         }),
         buttonEditor = new ymaps.control.Button({
         data: {
         content: "Режим редактирования"
         },
         options: {
         maxWidth: 300
         }
         });

         buttonEditor.events.add("select", function () {
         /**
         * Включение режима редактирования.
         * В качестве опций может быть передан объет с полями:
         * addWayPoints - разрешает добавление новых путевых точек при клике на карту. Значение по умолчанию: false.
         * dragWayPoints - разрешает перетаскивание уже существующих путевых точек. Значение по умолчанию: true.
         * removeWayPoints - разрешает удаление путевых точек при двойном клике по ним. Значение по умолчанию: false.
         * dragViaPoints - разрешает перетаскивание уже существующих транзитных точек. Значение по умолчанию: true.
         * removeViaPoints - разрешает удаление транзитных точек при двойном клике по ним. Значение по умолчанию: true.
         * addMidPoints - разрешает добавление промежуточных транзитных или путевых точек посредством перетаскивания маркера, появляющегося при наведении курсора мыши на активный маршрут. Тип добавляемых точек задается опцией midPointsType. Значение по умолчанию: true
         * @see http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml#editor
         *//*
         multiRoute.editor.start({
         addWayPoints: true,
         removeWayPoints: true
         });
         });
         buttonEditor.events.add("deselect", function () {
         // Выключение режима редактирования.
         multiRoute.editor.stop();
         });

         myMap.geoObjects.add(multiRoute);
         myMap.controls.add(buttonEditor);
         */

        insertAddress.bind({ymaps: ymaps, map: myMap});
    }

    ymaps.ready(init);

    var suggestAddress = function(e) {

        var $thisEl = $(this);
        $suggestInputField = $thisEl;
        var url = 'http://suggest-maps.yandex.ru/suggest-geo';
        var data = {
            callback: 'insertAddress',
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

    $('.js-start-input, .js-finish-input').keyup(suggestAddress);
});

var $suggestInputField;
var insertAddress = function(data) {
    var $container = $('.js-suggest-address-items');
    var $ul = $('.js-suggest-address-items > ul');
    var items = data[1];
    $ul.empty();
    $container.show();
    var ymaps = this.ymaps;
    var map = this.map;
    for (var i = 0, l = items.length; i < l; i++) {
        $el = $('<li>' + items[i][1] + '</li>');
        $el.click(function(){
            $suggestInputField.val($(this).text());
            $container.hide();


            var firstPoint, secondPoint;
            if ($suggestInputField.hasClass('js-start-input')) {
                firstPoint = $suggestInputField.val();
                secondPoint = $('.js-finish-input').val();
            } else {
                firstPoint  = $('.js-finish-input').val();
                secondPoint = $suggestInputField.val();
            }
            if (firstPoint && secondPoint) {
                debugger;
                ymaps.route([
                    firstPoint,
                    {type: "wayPoint", point: firstPoint},
                    secondPoint,
                    {type:"wayPoint", point: secondPoint}
                ]).then(function(route){
                    debugger;
                    map.geoObjects.add(route);
                    var distance = Math.round(route.getLength() / 1000);
                    $('.js-distance').html(distance);
                    $('.js-price').html(180 + distance * 25);

                    var points = route.getWayPoints(),
                        lastPoint = points.getLength() - 1;

                    points.get(0).properties.set('iconContent', 'Точка отправления');
                    points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');

                    console.log( points.get(0) );
                });
//                var distance = Math.round(route.getLength() / 1000);
//                $('.js-distance').html(distance);
//                $('.js-price').html(180 + distance * 25);
//
//                var points = route.getWayPoints(),
//                    lastPoint = points.getLength() - 1;
//
//                points.get(0).properties.set('iconContent', 'Точка отправления');
//                points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');
//
//                console.log( points.get(0) );
            }
        });
        $ul.append($el);
    }
};
