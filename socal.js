function SoCal(options) {
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
    this.toggleSelect = true;
    this.dateRangeEditPosition = null;

    this.inputValue = {};
    this.dateRange = {};
    this.dateRangesArray = [];
    this.calendarEl;
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
    this.dateSelectEnabled = true;
    this.dateRangeEnabled = true;

    return this;
};

SoCal.prototype.enableShowDateRanges = function() {
  this.showDateRanges = true;

  return this;
};

SoCal.prototype.enableMinDate = function(date) {
    this.minDateEnabled = true;
    this.minDate = date ? new Date(this.util.formatDate.call(this, date, 'numeric')) : this.today;

    return this;
}

SoCal.prototype.enableCalendarLevels = function() {
    this.calendarLevelsEnabled = true;

    return this;
}

SoCal.prototype.enableDateSelectToggle = function() {
    this.toggleSelect = true;

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
    this.monthEndOffset = (6 * 7) - (this.daysInCurrentMonth + this.monthStartOffset);
    this.currentMonthDisplay = this.config.month_long[this.currentMonth];
};

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

    (day.dataset.type === 'previous') && this.setPreviousMonth();
    (day.dataset.type === 'next') && this.setNextMonth();

    this.setActiveDate(new Date(this.currentYear, this.currentMonth, day.dataset.day));
};

SoCal.prototype.setActiveDate = function(date) {
  if (this.toggleSelect) {
    var intersect = this.removeIntersectingDate(date);
    if (intersect) {
      return;
    }
  } else {
    this.selectedDate = date;
  }

  if (this.dateRangeEnabled) {
      this.addToDateRange(date);
      this.dateRangeEditPosition = null;
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

SoCal.prototype.addDate = function(date, position) {
    this.dateRange[position + '_date'] = date;
    this.dateRange[position + '_display'] = this.util.formatDate.call(this, date, 'semantic');

    this.callbacks.dateRangeChange && this.callbacks['dateRangeChange'].call(this, this.dateRange);
};

SoCal.prototype.addToDateRange = function(date) {
    var range = this.config.daterange_positions;

    if (this.dateRangeEditPosition === 'start' || (!this.dateRange.start_date && !this.dateRangeEditPosition)) {
        this.addDate(date, 'start');
        return this;
    } else if (this.dateRangeEditPosition === 'end') {
        this.addDate(date, 'end');
        return this;
    }

    var startGreaterThanEndDate = +(date.valueOf() > this.dateRange.start_date.valueOf());

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

SoCal.prototype.removeDate = function(position) {
    event.stopPropagation();
    delete this.dateRange[position + '_date'];
    delete this.dateRange[position + '_display'];
    this.clearSelectedDate();
    this.callbacks['dateRangeChange'] && this.callbacks['dateRangeChange'].call(this, this.dateRange);
    this.updateCalendar(this.currentDay);
}

SoCal.prototype.removeIntersectingDate = function(date) {
  var dateValue = date.valueOf();
  if (!this.dateRangeEnabled && this.selectedDate.valueOf() === dateValue) {
    this.clearSelectedDate();
    return true;
  }

  if (this.dateRange.start_date && dateValue === this.dateRange.start_date.valueOf()) {
    this.removeDate('start');
    return true;
  } else if (this.dateRange.end_date && dateValue === this.dateRange.end_date.valueOf()) {
    this.removeDate('end');
    return true;
  }

  return false;
}

SoCal.prototype.clearSelectedDate = function() {
    this.dateRangeEditPosition = null;
    this.selectedDate = undefined;
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
