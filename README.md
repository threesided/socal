# socal: A simple date picker plugin.

Socal is a fully functional datepicker with a simple setup and robust functionality. It is intended specifically for use in applications where dates need to be selected. It is not meant to operate as a full fledged calendar widget... yet!

### Initial Setup

Include the socal.min.js script in the head of your html:
```html
<script type="text/javascript" src="socal.min.js"></script>
```

Initialize SoCal with an element on your page. This requires some element for SoCal to bind to, and the initialization script itself.:
```html
<body>
  <div id="calendar"></div>
</body>

<script type="text/javascript">
  function main() {
  var soCal = new SoCal();
  soCal
    .bindTo('#calendar'); //An id tag is best here.
  }
  document.addEventListener('DOMContentLoaded', main);
</script>

```

Calling the `.bindTo()` method is what will initialize the date picker, so all other methods used to setup functionality should be declared before the `bindTo()` call.

Out of the box, SoCal is set up without interaction. In order to activate its functionality you have a couple options:

#### .enableDateSelection()

This is the most basic interaction behavior. This allows dates to be selected.

#### .enableDateRangeSelection()

This allows for date ranges to be selected. Date selection is also set by default when this is enabled.

#### .onDateChange(callback) and .onDateRangeChange(callback)

If you wish to do something once a date has been selected, use this to attach a callback to the event. The difference between which to use is contingent on what type of functionality you are trying to achieve.
