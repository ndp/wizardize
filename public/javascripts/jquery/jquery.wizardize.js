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
 * The following events are broadcast:
 * On wizard:
 *  'prevButtonClicked'
 *  'nextButtonClicked'
 *
 * On each fieldset:
 *
 *
 * The follow events are processed:
 *  'prevButtonClicked' - simulate a click on the previous button
 *  'nextButtonClicked' - simulate a click on the next button
 *
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
        config.showFieldset($context, indexToHide, indexToShow);
      }
    });

    // hide all but the first fieldset
    $('fieldset:not(:first)', $context).hide();
    $('fieldset:first', $context).addClass("enabled");
    $('li:first', $context).addClass("enabled");

    // Add next and prev buttons
    var prevButtonClicked = function(e) {
      if (e) {
        e.preventDefault();
      }
      var $fieldsetClicked = $(this).parents('fieldset:first');
      var index = $fieldsets.index($fieldsetClicked);
      config.showFieldset($context, index, index - 1);
    };
    $context.bind('prevButtonClicked', function() {
      $('fieldset:visible .next_prev_buttons .prev', $context).each(function() {
        prevButtonClicked.apply(this)
      })
    });
    $context.bind('nextButtonClicked', function(e, origEvent) {
      if (origEvent) {
        origEvent.preventDefault();
      }
      var $fieldsetClicked = $('fieldset:visible', $context);
      var index = $fieldsets.index($fieldsetClicked);
      if (!config.validateFieldset.call($fieldsetClicked[0])) {
        return;
      }
      if ($fieldsetClicked.hasClass("complete")) {
        var $newFieldset = $fieldsetClicked.next(':first');
        config.showFieldset($context, index, index + 1);
        if (config.nextCallback) {
          config.nextCallback.call($newFieldset.get(0), index + 1);
        }
      }
    });

    // Add all the buttons we need
    $('fieldset', $context).each(function(index) {
      var $nextPrev = $('<div class="next_prev_buttons"/>').appendTo($(this));
      if (index !== 0) { // all but first need "prev" button
        $('<a class="prev">' + config.prevButton + '</a>').click(prevButtonClicked).appendTo($nextPrev);
      }
      // all but last need a "next" button
      if (index < ($('fieldset', $context).length - 1)) {
        $('<a class="next">' + config.nextButton + '</a>').click($.fn.wizardize.next).appendTo($nextPrev);
      } else {
        // last needs the submit button... rebuild one ourselves
        var submitText = $('input:submit', $context).remove().val();
        $('<a class="next submit">' + submitText + '</a>').click(function() {
          $context.submit();
        }).appendTo($nextPrev);
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
  statusButtonsSpacer: null,
  validateFieldset: function() {
    return true;
  },
  showFieldset: function($wizardContext, indexToHide, indexToShow) {
    $("fieldset:nth(" + indexToShow + ")", $wizardContext).show();
    $("fieldset:nth(" + indexToHide + ")", $wizardContext).hide();

    var $statusButtons = $wizardContext.find("ol:first li:not(.wzdr_spacer)");

    $($statusButtons[indexToHide]).removeClass('active');
    $($statusButtons[indexToShow]).addClass('active');

    window.scroll(0, 0);
  }
};

// backward compatible
$.fn.wizardize.previous = function(e) {
  $(this).parents('.wizardized:first').trigger('prevButtonClicked', e);
}

// backward compatible
$.fn.wizardize.next = function(e) {
  $(this).parents('.wizardized:first').trigger('nextButtonClicked', e);
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

