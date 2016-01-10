SoCal.prototype.renderCalendar = function() {
    if (this.calendarCollapsed) {
        this.calendarEl.classList.add('collapsed');
    } else {
        this.calendarEl.classList.remove('collapsed');
    }

    var soCal = document.createElement('div');
        soCal.classList.add('so-cal-container');

    var calendarHTML = '';

    this.dateRangeEnabled && (calendarHTML +=
        '<div class="so-cal-daterange-header">' +
              '<div class="so-cal-date ' + (this.dateRangeEditPosition === 'start' ? 'active' : '') + '" id="start-date">' +
                  '<div class="so-cal-daterange-subheader">Start Date</div>' +
                  (this.dateRange.start_display ? this.dateRange.start_display + '<span class="remove-date" id="remove-start-date">&times;</span>' : '...') +
              '</div>' +
              '<div class="so-cal-date ' + (this.dateRangeEditPosition === 'end' ? 'active' : '') + '" id="end-date">' +
                  '<div class="so-cal-daterange-subheader">End Date</div>' +
                  (this.dateRange.end_display ? this.dateRange.end_display + '<span class="remove-date" id="remove-end-date">&times;</span>' : '...') +
              '</div>' +
        '</div>');

    (this.calendarLevel === 'day') && (calendarHTML += this.renderDayCalendar());
    (this.calendarLevel === 'month') && (calendarHTML += this.renderMonthCalendar());
    (this.calendarLevel === 'year') && (calendarHTML += this.renderYearCalendar());

    if (this.showDateRanges && (this.dateRange.start || this.dateRangesArray.length)) {
      calendarHTML += this.renderDateRanges();
    }

    this.calendarEl.innerHTML = '';
    soCal.innerHTML = calendarHTML;
    this.calendarEl.appendChild(soCal);
};

SoCal.prototype.renderDayCalendar = function () {
    var dayTitles = this.renderDays('short');
    var daysBeforeMonth = this.renderDaysBeforeMonth();
    var daysCurrentMonth = this.renderDaysCurrentMonth();
    var daysAfterMonth = this.renderDaysAfterMonth();

    var monthHeaderClass = this.calendarLevelsEnabled ? 'clickable' : '';

    var html =
        '<div class="so-cal-header no-select">' +
            '<div id="so-cal-previous" class="so-cal-changer"><span class="arrow-icon">‹</span></div>' +
            '<div class="so-cal-month-title ' + monthHeaderClass + '" id="month-header">' + this.currentMonthDisplay + (this.showYearEnabled ? ' - ' + this.currentYear : '') + '</div>' +
            '<div id="so-cal-next" class="so-cal-changer"><span class="arrow-icon">›</span></div>' +
        '</div>' +
        '<div class="so-cal-days-header">' + dayTitles + '</div>' +
        '<div class="so-cal-date-grid">' + daysBeforeMonth + daysCurrentMonth + daysAfterMonth +
        '</div>';
    return html;
};

SoCal.prototype.renderMonthCalendar = function () {
    var self = this;
    var monthHeaderClass = this.calendarLevelsEnabled ? 'clickable' : '';
    var monthEls = '';

    this.config.month_short.forEach(function(v, i) {
        var currentMonth = (
          self.currentYear === self.date.getFullYear() &&
          self.currentMonth === i
        ) ? 'current-month ' : '';
        var monthDisabled = (
          (self.minDateEnabled &&
          self.currentYear <= self.minDate.getFullYear() &&
          i < self.minDate.getMonth()) ||
          self.currentYear < self.date.getFullYear()
        ) ? 'disabled ' : '';
        var extraClasses = currentMonth + monthDisabled;

        monthEls += '<div class="so-cal-month ' + extraClasses + '">' + v + '</div>';
    });

    var html =
        '<div class="so-cal-header no-select">' +
            '<div id="so-cal-previous" class="so-cal-changer"><span class="arrow-icon">‹</span></div>' +
            '<div class="so-cal-month-title month-view ' + monthHeaderClass + '" id="year-header">' + this.currentYear + '</div>' +
            '<div id="so-cal-next" class="so-cal-changer"><span class="arrow-icon">›</span></div>' +
        '</div>' +
        '<div class="so-cal-date-grid">' + monthEls + '</div>';

    return html;
};

SoCal.prototype.renderYearCalendar = function () {
    var self = this;
    var yearHeaderClass = this.calendarLevelsEnabled ? 'clickable' : '';
    var yearEls = '';
    for (var i = (self.currentYear - 5); i <= self.currentYear + 6; i++) {
      var currentYear = self.currentYear === i ? 'current-year ' : '';
      var yearDisabled = (self.minDateEnabled && i < self.minDate.getFullYear()) ? 'disabled ' : '';
      var extraClasses = currentYear + yearDisabled;

      yearEls += '<div class="so-cal-year ' + extraClasses + '">' + i + '</div>';
    }

    var html =
        '<div class="so-cal-header no-select">' +
            '<div class="so-cal-month-title year-view ' + yearHeaderClass + '" id="day-header">' + (this.currentYear - 5) + '-' + (this.currentYear + 6) + '</div>' +
        '</div>' +
        '<div class="so-cal-date-grid">' + yearEls + '</div>';

    return html;
};

SoCal.prototype.renderDays = function(type) {
    var days = [];
    var dayType = 'day_' + type;
    for (var i = 0; i < 7; i++) {
        days.push('<div class="so-cal-day-title"> ' + this.config[dayType][i] + ' </div>');
    }
    return days.join('');
};

SoCal.prototype.renderDaysBeforeMonth = function() {
    var daysInPreviousMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    var days = [];
    for (var i = 0; i < this.monthStartOffset; i++) {

        var today = new Date(this.currentYear, this.currentMonth - 1, daysInPreviousMonth - i).valueOf();
        var extraClasses = this.util.checkDateParams.call(this, today);

        days.push('<div class="so-cal-day inactive ' + extraClasses + '" data-type="previous" data-day="' + (daysInPreviousMonth - i) + '"> ' + (daysInPreviousMonth - i) + ' </div>');
    }
    days.reverse();
    return days.join('');
}

SoCal.prototype.renderDaysCurrentMonth = function() {
    var days = [];
    for (var i = 0; i < this.daysInCurrentMonth; i++) {

        var today = new Date(this.currentYear, this.currentMonth, i + 1).valueOf();
        var extraClasses = this.util.checkDateParams.call(this, today);

        days.push('<div class="so-cal-day current-month ' + extraClasses + '" data-type="current" data-day="' + (i + 1) + '">' + (i + 1) + '</div>');

    }
    return days.join('');
};

SoCal.prototype.renderDaysAfterMonth = function() {
    var days = [];
    for (var i = 0; i < this.monthEndOffset; i++) {

        var today = new Date(this.currentYear, this.currentMonth + 1, i + 1).valueOf();
        var extraClasses = this.util.checkDateParams.call(this, today);

        days.push('<div class="so-cal-day inactive ' + extraClasses + '" data-type="next" data-day="' + (i + 1) + '">' + (i + 1) + '</div>');

    }
    return days.join('');
};

SoCal.prototype.renderDateRanges = function() {
    var rangeHTML = '';
    if (this.dateRangesArray.length) {
        this.dateRangesArray.forEach(function(v, i) {
            rangeHTML +=
              '<div class="so-cal-daterange">' +
                v.start_display + (v.end_display ? ' - ' + v.end_display : '') +
                '<span class="so-cal-remove-daterange" data-index="' + i + '">&times;</span>' +
              '</div>';
        });
    } else {
      rangeHTML +=
        '<div class="so-cal-daterange">' +
            this.dateRange.start_display + (this.dateRange.end_display ? ' - ' + this.dateRange.end_display : '') +
            '<span class="so-cal-remove-daterange" data-index="-1">&times;</span>' +
        '</div>';
    }
    return rangeHTML;
};
