var app = angular.module("occupyparking", ['ngSanitize']);

app.controller("homeCtrl", function ($scope, $http, $interval) {



    $scope.user = get('user')

    $scope.bookings = [];

    refresh();


    $interval(function () {
        refresh();
    }, 20000)


    $scope.ref = function () {
        refresh();
    }

    function refresh() {
        if (online()) {
            $.ajax({
                url: apiEndpoint + 'getTodaysBookingsByLot',
                type: 'get',
                data: {pid: get('user').parkingLot},
                success: function (data) {
                    $scope.$applyAsync(function () {
                        $scope.bookings = data;
                    });
                    set("bookings", {lastSync: new Date(), data: data});
                }
            });

        } else {
            if (get('bookings') != null)
                $scope.bookings = get('bookings').data;
        }

    }

    $scope.ncheckout = function (oid) {
        var data = {oid: oid, userId: get('user').ID};
        var url = apiEndpoint + 'checkout';
        var type = 'POST';




        var r = confirm("Confirm Checkout?");
        if (r == true) {
            if (online()) {
                $.ajax({
                    url: url,
                    type: type,
                    data: data,
                    success: function (data) {
                        $scope.$applyAsync(function () {
                            if (data == 1) {
//                                    objIndex = $scope.bookings.findIndex((obj => obj.id == oid));
//                                    $scope.bookings[objIndex].bstatus = 3;
//                                   
                                toast("Checkout Done")
                            } else {
                                toast("Oops ... looks like something went wrong.")
                            }
                        });
                        set("bookings", {lastSync: new Date(), data: $scope.bookings});
                    }
                });

            } else {
                if (get('toSync') == null || !isArray(get('toSync')))
                    set("toSync", JSON.stringify([]));

                var toSync = get('toSync');
                toSync.push({url: url, data: data, type: type, pushedOn: new Date()});
                set('toSync', toSync);

            }
        }




    }

    $scope.scheckout = function (oid, time) {
        var data = {oid: oid, userId: get('user').ID};
        var url = apiEndpoint + 'scheckout';
        var type = 'POST';

        var startDate = new Date(time).getTime();
        var endDate = new Date().getTime();

        var timeStart = new Date(time).getTime();
        var timeEnd = new Date().getTime();
        var hourDiff = timeEnd - timeStart; //in ms
        var secDiff = hourDiff / 1000; //in s
        var minDiff = hourDiff / 60 / 1000; //in minutes
        var hDiff = hourDiff / 3600 / 1000; //in hours
        var humanReadable = {};
        humanReadable.hours = Math.floor(hDiff);
        humanReadable.minutes = minDiff - 60 * humanReadable.hours;



        var amt = prompt("Total Parked Time : " + humanReadable.hours + " Hours " + humanReadable.minutes + " Mins. Enter Amount Collected", "");

        if (amt != null) {

            data.amt = amt;

            var r = confirm("Confirm Checkout?");
            if (r == true) {
                if (online()) {
                    $.ajax({
                        url: url,
                        type: type,
                        data: data,
                        success: function (data) {
                            $scope.$applyAsync(function () {
                                if (data == 1) {
                                    objIndex = $scope.bookings.findIndex((obj => obj.id == oid));
                                    $scope.bookings[objIndex].bstatus = 3;
                                    toast("Checkout Done")
                                } else {
                                    toast("Oops ... looks like something went wrong.")
                                }
                            });
                            set("bookings", {lastSync: new Date(), data: $scope.bookings});
                        }
                    });

                } else {
                    if (get('toSync') == null || !isArray(get('toSync')))
                        set("toSync", JSON.stringify([]));

                    var toSync = get('toSync');
                    toSync.push({url: url, data: data, type: type, pushedOn: new Date()});
                    set('toSync', toSync);

                }
            }
        }



    }


    $scope.checkin = function (oid) {

        var data = {oid: oid, userId: get('user').ID};
        var url = apiEndpoint + 'checkin';
        var type = 'POST';


        var r = confirm("Confirm Checkin?");
        if (r == true) {

            if (online()) {
                $.ajax({
                    url: url,
                    type: type,
                    data: data,
                    success: function (data) {
                        $scope.$applyAsync(function () {
                            if (data == 1) {
                                objIndex = $scope.bookings.findIndex((obj => obj.id == oid));
                                $scope.bookings[objIndex].bstatus = 2;
                                toast("Checkin Done")
                            } else {
                                toast("Oops ... looks like something went wrong.")
                            }
                        });
                        set("bookings", {lastSync: new Date(), data: $scope.bookings});
                    }
                });

            } else {
                if (get('toSync') == null || !isArray(get('toSync')))
                    set("toSync", JSON.stringify([]));

                var toSync = get('toSync');
                toSync.push({url: url, data: data, type: type, pushedOn: new Date()});
                set('toSync', toSync);

            }
        }


    }


    $scope.minout = function (oid, otype) {

        var data = {oid: oid, userId: get('user').ID, type: otype};
        var url = apiEndpoint + 'minout';
        var type = 'POST';
        var msg = otype == 1 ? 'Checkin Done' : 'Checkout Done';

        var r = confirm("Confirm " + (otype == 1 ? 'Checkin' : 'Checkout') + "?");
        if (r == true) {

            if (online()) {
                $.ajax({
                    url: url,
                    type: type,
                    data: data,
                    success: function (data) {
                        $scope.$applyAsync(function () {
                            if (data) {
                                objIndex = $scope.bookings.findIndex((obj => obj.id == oid));
                                $scope.bookings[objIndex] = data;
                                toast(msg);

                            }
                        });
                        set("bookings", {lastSync: new Date(), data: $scope.bookings});
                    }
                });

            } else {
                if (get('toSync') == null || !isArray(get('toSync')))
                    set("toSync", JSON.stringify([]));

                var toSync = get('toSync');
                toSync.push({url: url, data: data, type: type, pushedOn: new Date()});
                set('toSync', toSync);

            }
        }


    }



    $scope.addBooking = function () {
        var data = $("#addBooking").serialize();
        var url = apiEndpoint + 'addBooking';
        var type = 'POST';


        var r = confirm("Confirm Booking?");
        if (r == true) {

            if (online()) {
                $.ajax({
                    url: url,
                    type: type,
                    data: data,
                    success: function (data) {
                        if (data == 'Booking added') {
                            toast("Booking Added.");
                            $('.modal-close').click();
                            $('#addBooking').each(function () {
                                this.reset();
                            });
                        } else {
                            toast(data);
                        }
                    }
                });

            } else {
                if (get('toSync') == null || !isArray(get('toSync')))
                    set("toSync", JSON.stringify([]));

                var toSync = get('toSync');
                toSync.push({url: url, data: data, type: type, pushedOn: new Date()});
                set('toSync', toSync);

            }
        }
    }

});

function req(url, data, type) {


}


$(document).ready(function () {
    $("input[name='search']").keyup(function (e) {
        var sterm = $(this).val();
        if (sterm == "") {

            $(".contact").show();
            $(".ftest1").click();

        } else {

            $(".contact").hide();
            $(".contact[data-booking-id='" + sterm + "']").show();
            $(".f" + $(".contact[data-booking-id='" + sterm + "']").parent().parent().parent().parent().attr('id')).click()

            $(".contact[data-vehicle-number='" + sterm + "']").show();
            $(".f" + $(".contact[data-vehicle-number='" + sterm + "']").parent().parent().parent().parent().attr('id')).click()


        }

    });
});