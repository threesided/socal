SoCal.prototype.config = {
    month_long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    month_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    day_long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    day_short: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
    day_mini: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'],
    daterange_positions: ['start', 'end'],
    calendarLevels: ['day', 'month', 'year'],
};

SoCal.prototype.util = {
    checkMonth: function(month) {
        if (month === 12) {
            return 0;
        } else if (month === -1) {
            return 11;
        }
        return month;
    },
    checkDateParams: function(date) {
        var self = this;
        var withinRange = '';
        var startCap = '';
        var endCap = ''
        var selected = '';
        var minDate = '';
        var today = (this.today.valueOf() === date) ? 'today' : '';

        var dateCheck = function(dateRange, rangeClass) {;
            !withinRange && (withinRange = (
                dateRange.start_date &&
                dateRange.start_date.valueOf() <= date &&
                dateRange.end_date &&
                dateRange.end_date.valueOf() >= date
            ) ? rangeClass : '');

            !startCap && (startCap = (
                dateRange.start_date &&
                dateRange.start_date.valueOf() === date
            ) ? 'start-cap ' : '');

            !endCap && (endCap = (
                dateRange.end_date &&
                dateRange.end_date.valueOf() === date
            ) ? 'end-cap ' : '');
        }

        if (this.dateRangesArray.length) {
            this.dateRangesArray.forEach(function(dateRange) {
              dateCheck.call(self, dateRange, (self.dateRangesRestricted ? 'restricted ' : 'within-range '));
            });
        }

        if (this.dateRange.start_date || this.dateRange.end_date){
            dateCheck.call(self, this.dateRange, 'within-range ');
        }

        !selected && (selected = (
            this.selectedDate &&
            this.selectedDate.valueOf() === date
        ) ? ' selected-day ' : '');

        this.minDateEnabled && !minDate && (minDate = (
            date < this.minDate.valueOf()
        ) ? 'disabled ' : '');

        return selected + withinRange + startCap + endCap + minDate + today;
    },
    formatDate: function(date, type) {
        var date = new Date(date);

        var types = {
            'numeric': date.toLocaleDateString(),
            'semantic': this.config.month_long[date.getMonth()] + ' ' +  date.getDate() + ', ' + date.getFullYear(),
        }

        return types[type];
    },
    formatDateRanges: function(dateArray) {
        if (typeof dateArray.start_date === 'string') {
          dateArray.start_date = new Date(dateArray.start_date.replace(/\-/g, '/'));
        }
        if (typeof dateArray.end_date === 'string') {
          dateArray.end_date = new Date(dateArray.end_date.replace(/\-/g, '/'));
        }

        dateArray.start_date && (dateArray.start_display = this.util.formatDate.call(this, dateArray.start_date, 'semantic'));
        dateArray.end_date && (dateArray.end_display = this.util.formatDate.call(this, dateArray.end_date, 'semantic'));

        return dateArray;
    }
};
