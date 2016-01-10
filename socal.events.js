SoCal.prototype.addAllEvents = function() {
    (this.calendarLevel === 'day') && this.addDayEvents();
    (this.calendarLevel === 'month') && this.addMonthEvents();
    (this.calendarLevel === 'year') && this.addYearEvents();
    this.dateRangeEnabled && this.addDateRangeEvents();
};

SoCal.prototype.addDayEvents = function() {
    var self = this;
    var previousMonthArrow = this.calendarEl.querySelector('#so-cal-previous');
    var nextMonthArrow = this.calendarEl.querySelector('#so-cal-next');
    var dates = this.calendarEl.querySelectorAll('.so-cal-day');
    var datesArray = Array.prototype.slice.call(dates);
    var monthHeader = this.calendarEl.querySelector('#month-header');

    this.dateSelectEnabled && (datesArray.forEach(function(dayEl) {
        dayEl.addEventListener('click', self.selectDate.bind(self, dayEl));
    }));

    monthHeader && this.calendarLevelsEnabled && monthHeader.addEventListener('click', this.setCalendarLevel.bind(this, 'month', true));
    previousMonthArrow && previousMonthArrow.addEventListener('click', this.setPreviousMonth.bind(this));
    nextMonthArrow && nextMonthArrow.addEventListener('click', this.setNextMonth.bind(this));
};

SoCal.prototype.addMonthEvents = function() {
    var self = this;
    var previousYearArrow = this.calendarEl.querySelector('#so-cal-previous');
    var nextYearArrow = this.calendarEl.querySelector('#so-cal-next');
    var months = this.calendarEl.querySelectorAll('.so-cal-month');
    var monthsArray = Array.prototype.slice.call(months);
    var yearHeader = this.calendarEl.querySelector('#year-header');

    monthsArray.forEach(function(monthEl, i) {
        monthEl.addEventListener('click', self.selectMonth.bind(self, i));
    });

    yearHeader.addEventListener('click', this.setCalendarLevel.bind(this, 'year', true));
    previousYearArrow && previousYearArrow.addEventListener('click', this.setPreviousYear.bind(this));
    nextYearArrow && nextYearArrow.addEventListener('click', this.setNextYear.bind(this));
};

SoCal.prototype.addYearEvents = function() {
    var self = this;
    var yearHeader = this.calendarEl.querySelector('#day-header');
    var years = this.calendarEl.querySelectorAll('.so-cal-year');
    var yearsArray = Array.prototype.slice.call(years);
    yearHeader.addEventListener('click', this.setCalendarLevel.bind(this, 'day', true));

    yearsArray.forEach(function(yearEl) {
        yearEl.addEventListener('click', self.selectYear.bind(self, yearEl.innerHTML));
    });
};

SoCal.prototype.addDateRangeEvents = function () {
    var self = this;
    var startDateHeader = this.calendarEl.querySelector('#start-date');
    var endDateHeader = this.calendarEl.querySelector('#end-date');
    var removeStartDateEl = this.calendarEl.querySelector('#remove-start-date');
    var removeEndDateEl = this.calendarEl.querySelector('#remove-end-date');
    var removeDaterangeEls = this.calendarEl.querySelectorAll('.so-cal-remove-daterange');
    var removeDaterangeArray = Array.prototype.slice.call(removeDaterangeEls);

    endDateHeader.addEventListener('click', this.setDateRangeEditPosition.bind(this, 'end'));
    startDateHeader.addEventListener('click', this.setDateRangeEditPosition.bind(this, 'start'));

    removeEndDateEl && removeEndDateEl.addEventListener('click', this.removeDate.bind(this, 'end'));
    removeStartDateEl && removeStartDateEl.addEventListener('click', this.removeDate.bind(this, 'start'));

    removeDaterangeArray.length && removeDaterangeArray.forEach(function(el, i) {
        el.addEventListener('click', self.removeDaterange.bind(self, el));
    });
};
