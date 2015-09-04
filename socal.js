var SoCal = function() {
    this.minDate;
    this.selectedDate;
    this.date = new Date();
    this.today = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());

    this.calendarLevel = 'day';

    this.currentDay;
    this.currentMonth;
    this.currentYear;
    this.currentWeekDay;
    this.daysInCurrentMonth;
    this.monthStartOffset;
    this.monthEndOffset;

    this.callbacks = {}

    this.calendarCollapseEnabled = false;
    this.calendarCollapsed = false;
    this.showYearEnabled = false;
    this.showDateRanges = false;
    this.minDateEnabled = false;
    this.dateRangeEnabled = false;
    this.dateSelectEnabled = false;
    this.calendarLevelsEnabled = false;
    this.dateInputEnabled = false;
    this.toggleSelect = true;
    this.dateRangeEditPosition = null;

    this.inputValue = {};
    this.dateRange = {};
    this.dateRangesArray = [];
    this.calendarEl;
};

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
        var types = {
            'numeric': date.getFullYear() + '-' + ((date.getMonth() + 1) < 10 ? 0 : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? 0 : '') + date.getDate(),
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

SoCal.prototype.enableCollapsed = function(startCollapsed) {
    this.calendarCollapseEnabled = true;
    this.calendarCollapsed = startCollapsed ? startCollapsed : false;

    return this;
};

SoCal.prototype.enableDateSelection = function() {
    this.dateSelectEnabled = true;

    return this;
};

SoCal.prototype.enableDateRanges = function() {
    this.dateRangeEnabled = true;
    this.dateSelectEnabled = true;

    return this;
};

SoCal.prototype.enableMinDate = function(date) {
    this.minDateEnabled = true;
    this.minDate = date ? new Date(date.split('-')) : this.today;

    return this;
}

SoCal.prototype.enableCalendarLevels = function() {
    this.calendarLevelsEnabled = true;

    return this;
}

SoCal.prototype.enableShowDateRanges = function() {
    this.showDateRanges = true;

    return this;
};

SoCal.prototype.enableDateInput = function() {
    this.dateInputEnabled = true;

    return this;
}

SoCal.prototype.enableDateSelectToggle = function(boolean) {
    this.toggleSelect = boolean;

    return this;
};

SoCal.prototype.showYear = function() {
    this.showYearEnabled = true;

    return this;
}

SoCal.prototype.bindTo = function(selector) {
    this.calendarElSelector = selector;
    this.calendarEl = document.querySelector(selector);
    this.calendarEl.classList.add('so-cal');
    this.init();

    return this;
};

SoCal.prototype.init = function() {
    this.getMonthParams();
    this.renderCalendar();
    this.addAllEvents();
};

SoCal.prototype.updateCalendar = function(dayValue) {
    this.date = new Date(this.currentYear, this.currentMonth, dayValue);
    this.init();
};

SoCal.prototype.getMonthParams = function() {
    this.currentDay = this.date.getDate();
    this.currentMonth = this.date.getMonth();
    this.currentYear = this.date.getFullYear();
    this.currentWeekday = this.date.getDay();
    this.daysInCurrentMonth = new Date(this.currentYear, (this.currentMonth + 1), 0).getDate();
    this.monthStartOffset = new Date(this.currentYear, this.currentMonth, 1).getDay();
    this.monthEndOffset = 42 - (this.daysInCurrentMonth + this.monthStartOffset);
    this.currentMonthDisplay = this.config.month_long[this.currentMonth];
};

SoCal.prototype.renderCalendar = function() {
    if (this.calendarCollapsed) {
        this.calendarEl.classList.add('collapsed');
    } else {
        this.calendarEl.classList.remove('collapsed');
    }

    var soCal = document.createElement('div');
        soCal.classList.add('so-cal-container');

    var calendarHTML = '';
    this.dateInputEnabled && (calendarHTML +=
        '<div class="so-cal-input">' +
            '<input class="date-input" id="date-input" placeholder="Select Date" value="' + (this.inputValue.date_display ? this.inputValue.date_display : '') + '">' +
        '</div>');

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

SoCal.prototype.addAllEvents = function() {
    (this.calendarLevel === 'day') && this.addDayEvents();
    (this.calendarLevel === 'month') && this.addMonthEvents();
    (this.calendarLevel === 'year') && this.addYearEvents();
    this.dateInputEnabled && this.addDateInputEvents();
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

    removeEndDateEl && removeEndDateEl.addEventListener('click', this.removeEndDate.bind(this));
    removeStartDateEl && removeStartDateEl.addEventListener('click', this.removeStartDate.bind(this));

    removeDaterangeArray.length && removeDaterangeArray.forEach(function(el, i) {
        el.addEventListener('click', self.removeDaterange.bind(self, el));
    });
};

SoCal.prototype.addDateInputEvents = function() {
    var input = this.calendarEl.querySelector('#date-input');
    input.addEventListener('blur', this.checkDateInput.bind(this, input));
};

SoCal.prototype.checkDateInput = function(inputEl) {
  var date = new Date(inputEl.value);

  (inputEl.value.toLowerCase() === "today" || inputEl.value.toLowerCase() === "t") && (date = this.today);

  if (date.valueOf() > 0) {
      var dateDisplay = this.util.formatDate.call(this, date, 'semantic');
      inputEl.value = dateDisplay;

      this.inputValue = {
        date: date,
        date_display: dateDisplay
      }
      this.currentMonth = date.getMonth();
      this.currentYear = date.getFullYear();
      this.setActiveDate(date);
  } else {
    this.inputValue = {};
    inputEl.value = '';
    this.updateCalendar(1);
  }
};

SoCal.prototype.onDateChange = function(callback) {
    this.callbacks['dateChange'] = callback;

    return this;
}

SoCal.prototype.onDateRangeChange = function(callback) {
    this.callbacks['dateRangeChange'] = callback;

    return this;
}

SoCal.prototype.onDateRangeArrayChange = function(callback) {
    this.callbacks['dateRangeArrayChange'] = callback;

    return this;
}

SoCal.prototype.setCalendarLevel = function(level, reRender) {
    this.calendarLevel = this.config.calendarLevels.indexOf(level) > -1 ? level : 'day';
    reRender && this.updateCalendar(this.currentDay);

    return this;
};

SoCal.prototype.setPreviousMonth = function () {
    this.currentMonth = this.util.checkMonth(--this.currentMonth);
    (this.currentMonth === 11) && (this.currentYear--);
    this.updateCalendar(1);
};

SoCal.prototype.setNextMonth = function () {
    this.currentMonth = this.util.checkMonth(++this.currentMonth);
    (this.currentMonth === 0) && (this.currentYear++);
    this.updateCalendar(1);
};

SoCal.prototype.setPreviousYear = function () {
    this.currentYear--;
    this.updateCalendar(1);
};

SoCal.prototype.setNextYear = function () {
    this.currentYear++;
    this.updateCalendar(1);
};

SoCal.prototype.selectDate = function(day) {
    if (day.classList.contains('disabled') || day.classList.contains('restricted')) {
        return;
    };

    var selectedDate;

    (day.dataset.type === 'previous') && this.setPreviousMonth();
    (day.dataset.type === 'next') && this.setNextMonth();

    selectedDate = new Date(this.currentYear, this.currentMonth, day.dataset.day);

    this.setActiveDate(selectedDate);
};

SoCal.prototype.setActiveDate = function(date) {
  if (this.selectedDate && this.selectedDate.valueOf() === date.valueOf() && this.toggleSelect) {
    this.clearSelectedDate();
  } else {
    this.selectedDate = date;
  }

  if (this.enableDateInput) {
      this.inputValue = {
        date: date,
        date_display: this.util.formatDate.call(this, date, 'semantic')
      }
  }

  if (this.dateRangeEnabled) {
      this.addToDateRange(date);
  }

  this.updateCalendar(date.getDate());
  this.callbacks['dateChange'] && this.callbacks['dateChange'].call(this, this.selectedDate);
}

SoCal.prototype.selectMonth = function(month) {
    this.currentMonth = month;
    this.calendarLevel = 'day';
    this.updateCalendar(this.currentDay);
}

SoCal.prototype.selectYear = function(year) {
    this.currentYear = year;
    this.calendarLevel = 'day';
    this.updateCalendar(this.currentDay);
}

SoCal.prototype.addToDateRange = function(date) {
    var range = this.config.daterange_positions;

    if (this.dateRangeEditPosition === 'start' || (!this.dateRange.start_date && !this.dateRangeEditPosition)) {

        this.dateRange.start_date = date;
        this.dateRange.start_display = this.util.formatDate.call(this, date, 'semantic');
        this.dateRangeEditPosition = null;

        if (this.dateRange.end_date && this.dateRange.end_date.valueOf() <= date.valueOf()) {
            this.dateRange.end_date = null;
            this.dateRange.end_display = null;
        }

        this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
        return this;

    } else if (this.dateRangeEditPosition === 'end') {

        this.dateRange.end_date = date;
        this.dateRange.end_display = this.util.formatDate.call(this, date, 'semantic');
        this.dateRangeEditPosition = null;

        if (this.dateRange.start_date && this.dateRange.start_date.valueOf() >= date.valueOf()) {
            delete this.dateRange.start_date;
            delete this.dateRange.start_display;
        }

        this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
        return this;

    }

    var startGreaterThanEndDate = date.valueOf() > this.dateRange.start_date.valueOf() | 0;

    // if (this.dateRange.start && date.valueOf() === this.dateRange.start.valueOf()) {
    //     this.removeStartDate();
    //     this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    //     return;
    // } else if (this.dateRange.end && date.valueOf() === this.dateRange.end.valueOf()) {
    //     this.removeEndDate();
    //     this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    //     return;
    // }

    if (startGreaterThanEndDate === 0) {
        this.dateRange.end_date = this.dateRange.start_date;
        this.dateRange.end_display = this.dateRange.start_display;
    }

    this.dateRange[range[startGreaterThanEndDate] + '_date'] = date;
    this.dateRange[range[startGreaterThanEndDate] + '_display'] = this.util.formatDate.call(this, date, 'semantic');

    this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
};


SoCal.prototype.setDateRange = function(date) {
    this.dateRange = this.util.formatDateRanges.call(this, date);
    return this;
}

SoCal.prototype.setDateRanges = function(dateRanges, restricted) {
    var self = this;

    restricted && (this.dateRangesRestricted = true);
    if (!(dateRanges instanceof Array)) {
      this.dateRange = self.util.formatDateRanges.call(self, dateRanges);
      this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    } else {
      this.dateRangesArray = dateRanges.map(function(v) {
          return self.util.formatDateRanges.call(self, v);
      });
      this.callbacks['dateRangeArrayChange'] && this.callbacks['dateRangeArrayChange'].call(this, this.dateRangesArray);
    }

    return this;
}

SoCal.prototype.setDateRangeEditPosition = function(value) {
    var activeDate = this.calendarEl.querySelector('.so-cal-date.active');
    activeDate && activeDate.classList.remove('active');

    if (this.dateRangeEditPosition === value) {
        this.dateRangeEditPosition = null;
        return;
    }

    event.currentTarget.classList.add('active');
    this.dateRangeEditPosition = value;

    return this;
};

SoCal.prototype.toggleCollapsed = function() {
    if (!this.calendarCollapseEnabled) {
      return;
    }

    if (this.calendarEl.classList.contains('collapsed')) {
        this.calendarEl.classList.remove('collapsed');
        this.calendarCollapsed = false;
    } else {
        this.calendarEl.classList.add('collapsed');
        this.calendarCollapsed = true;
    }
};

SoCal.prototype.removeStartDate = function(e) {
    delete this.dateRange.start_date;
    delete this.dateRange.start_display;
    this.clearSelectedDate();
    this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    this.updateCalendar(this.currentDay);
}

SoCal.prototype.removeEndDate = function(e) {
    delete this.dateRange.end_date;
    delete this.dateRange.end_display;
    this.clearSelectedDate();
    this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    this.updateCalendar(this.currentDay);
}

SoCal.prototype.clearSelectedDate = function() {
    this.dateRangeEditPosition = null;
    this.selectedDate = undefined;
    this.dateInputEnabled && (this.inputValue = {});
};

SoCal.prototype.removeDaterange = function(el) {
    if (el && el.dataset.index > -1) {
        this.dateRangesArray.splice(el.dataset.index, 1);
        this.callbacks['dateRangeArrayChange'] && this.callbacks['dateRangeArrayChange'].call(this, this.dateRangeArray, this.dateRange);
    } else {
        this.dateRange = {};
        this.selectedDate = null;
        this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    }

    this.clearSelectedDate();
    this.init();
};
