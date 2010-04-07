/**
 This plugin takes a regular form and creates separate panels out of it based
 on the fieldsets included in the page.

 * hides all but the first page
 * adds a list of "status buttons" as the first element in the form. Style as
 you see appropriate (or "form ol:first-child { display: none})
 * adds "next" and "previous" buttons to each panel
 * The regular submit button for the form is moved to the last panel.

 wizardize accepts an options hash:

 *  statusButtonsTemplate: how the status buttons are named. Supports simple
 variable substitution: '$TITLE' is the title tag of the fieldset, "$#" is
 the index of the fieldset. Therefore, to generate status buttons like
 "Step 3: provide your credentials", use "Step $#: $TITLE"
 *  statusButtonsSpacer: any html to add between the generated status buttons.
 By default the status buttons are just an ordered list of the names of
 the panels.
 *  nextButton: name of the next button added to each panel. Defaults to 'Next'.
 *  prevButton: name of the previous button added to each panel. 'Previous',
 *  nextCallback: function to be called when the user goes to the next panel
 *
 *
 * The following events are available:
 * On wizard:
 */
$.fn.wizardize = function(options) {

  var config = $.extend({}, $.fn.wizardize.defaults, options);

  $(this).each(function() {

    var $context = $(this).addClass('wizardized').data('config', config);

    var $fieldsets = $('fieldset', $context);

    // Build the status buttons
    var titles = $fieldsets.map(function(n) {
      var title = (config.statusButtonsTemplate) ?
        config.statusButtonsTemplate.replace(/\$#/, n + 1).replace(/\$TITLE/, this.title) :
        config.statusButtonTemplateFunction(n + 1, this.title);
      return "<li>" + title + "</li>";
    });
    titles = $.makeArray(titles).join(config.statusButtonsSpacer ? '<li class="wzdr_spacer">' + config.statusButtonsSpacer + '</li>' : '');
    var $statusButtonArea = $('<ol />').prependTo($context);
    $statusButtonArea.html(titles);
    $statusButtonArea.find('li:first').addClass('active');

    var allowedToMoveForward = function(indexToShow, indexToHide) {
      return $("fieldset:nth(" + indexToHide + ")", $context).hasClass("complete") && $("fieldset:nth(" + indexToShow + ")", $context).hasClass("enabled");
    };

    var $statusButtons = $("li:not(.wzdr_spacer)", $statusButtonArea);
    $statusButtons.click(function() {
      var indexToShow = $statusButtons.index($(this));
      var $currentlyShowing = $("li.active:first", $statusButtonArea);
      var indexToHide = $statusButtons.index($currentlyShowing);
      if (indexToShow < indexToHide || allowedToMoveForward(indexToShow, indexToHide)) {
        $.fn.wizardize.showFieldset($context, indexToHide, indexToShow);
      }
    });

    // hide all but the first fieldset
    $('fieldset:not(:first)', $context).hide();
    $('fieldset:first', $context).addClass("enabled");
    $('li:first', $context).addClass("enabled");

    // Add next and prev buttons
    $('fieldset', $context).each(function(index) {
      var $nextPrev = $('<div />').appendTo($(this)).addClass("next_prev_buttons");
      if (index !== 0) { // all but first need "prev" button
        $nextPrev.append('<a>' + config.prevButton + '</a>').find('a:last').addClass('prev').click($.fn.wizardize.previous);
      }
      // all but last need a "next" button
      if (index < ($('fieldset', $context).length - 1)) {
        $nextPrev.append('<a>' + config.nextButton + '</a>').find('a:last').addClass('next').click($.fn.wizardize.next);
      } else {
        // last needs the submit button... rebuild one ourselves
        var submitText = $('input:submit', $context).remove().val();
        $nextPrev.append('<a>' + submitText + '</a>').find('a:last').addClass('next').addClass('submit').click(function() {
          $context.submit();
        });
      }
    });
  });
  return this;
};


$.fn.wizardize.defaults = {
  nextCallback: null,
  nextButton: 'Next',
  prevButton: 'Previous',
  statusButtonsTemplate: null,
  statusButtonTemplateFunction: function(stepNumber, title) {
    return title;
  },
  statusButtonsSpacer: null
};


$.fn.wizardize.previous = function(e) {
  e.preventDefault();
  var $wizardContext = $(this).parents(".wizardized:first");
  var $fieldsetClicked = $(this).parents('fieldset:first');
  var $fieldsets = $fieldsetClicked.parents(':first').find('fieldset');
  var index = $fieldsets.index($fieldsetClicked);

  $.fn.wizardize.showFieldset($wizardContext, index, index - 1);
};

$.fn.wizardize.next = function(e) {
  e.preventDefault();

  var $wizardContext = $(this).parents('.wizardized:first');
  var $fieldsetClicked = $(this).parents('fieldset:first');
  var $fieldsets = $fieldsetClicked.parents(':first').find('fieldset');
  var index = $fieldsets.index($fieldsetClicked);

  var config = $wizardContext.data('config');

  if (config.validateFieldset) {
    var valid = config.validateFieldset.call($fieldsetClicked[0]);
    if (!valid) {
      return;
    }
  }

  if ($fieldsetClicked.hasClass("complete")) {
    var $newFieldset = $fieldsetClicked.next(':first');

    $.fn.wizardize.showFieldset($wizardContext, index, index + 1);

    if (config.nextCallback) {
      config.nextCallback.call($newFieldset.get(0), index + 1);
    }
  }
};

$.fn.wizardize.showFieldset = function($wizardContext, indexToHide, indexToShow) {
  $("fieldset:nth(" + indexToShow + ")", $wizardContext).show();
  $("fieldset:nth(" + indexToHide + ")", $wizardContext).hide();

  var $statusButtons = $wizardContext.find("ol:first li:not(.wzdr_spacer)");

  $($statusButtons[indexToHide]).removeClass('active');
  $($statusButtons[indexToShow]).addClass('active');

  window.scroll(0, 0);
};

$.fn.wizardizeMarkFieldsetAsComplete = function(index) {
  $("li:not(.wzdr_spacer):nth(" + (index + 1) + ")", this).addClass("enabled");
  $("fieldset:nth(" + (index + 1) + ")", $(this)).removeClass("disabled").addClass("enabled");

  $("li:not(.wzdr_spacer):nth(" + index + ")", $(this)).addClass("enabled").addClass('complete');
  $("fieldset:nth(" + index + ")", $(this)).addClass("complete");
  return this;
};

$.fn.wizardizeMarkFieldsetAsIncomplete = function(index) {
  $("li:not(.wzdr_spacer):gt(" + index + ")", $(this)).removeClass("enabled");
  $("fieldset:gt(" + index + ")", $(this)).removeClass("enabled").addClass("disabled");
  $("fieldset:gt(" + (index - 1) + ")", $(this)).removeClass("complete");
  return this;
};

