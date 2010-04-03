//TODO: not a proper jQuery function - can't chain
$.fn.wizardize = function(settings) {
  var config = $.extend({}, $.fn.wizardize.defaults, settings);
  var $context = $(this).addClass('wizardized').data('config', config);

  // create a list of the panels
  $context.prepend('<ol />');
  var $statusButtons = $context.find('ol:first');
  var $fieldsets = $('fieldset', $context);

  var titles = $fieldsets.map(function(n, i) {
    var title;
    if (config.statusButtonsTemplate) {
      title = config.statusButtonsTemplate.replace(/\$#/, n+1).replace(/\$TITLE/, this.title);
    }
    else {
      title = config.statusButtonTemplateFunction(n+1, this.title);
    }
    return "<li>" + title + "</li>";
  });
  titles = $.makeArray(titles).join(config.statusButtonsSpacer ? '<li class="spacer">' + config.statusButtonsSpacer + '</li>' : '');
  $statusButtons.html(titles);
  $statusButtons.find('li:first').addClass('active');

  var allowedToMoveForward = function(indexToShow, indexToHide) {
    return $("fieldset:nth(" + indexToHide + ")", $context).hasClass("complete") && $("fieldset:nth(" + indexToShow + ")", $context).hasClass("enabled")
  };

  $("li:not(.spacer)", $statusButtons).click(function() {
    var indexToShow = $("li:not(.spacer)", $statusButtons).index($(this));
    var $currentlyShowing = $("li.active:first", $statusButtons);
    var indexToHide = $("li:not(.spacer)", $statusButtons).index($currentlyShowing);
    if (indexToShow < indexToHide || allowedToMoveForward(indexToShow, indexToHide)) {
      $.fn.wizardize.showFieldset($context, indexToHide, indexToShow);
    }
  });

  // hide all but the first fieldset
  $('fieldset:not(:first)', $context).hide();
  $('fieldset:first', $context).addClass("enabled");
  $('li:first', $context).addClass("enabled");

  $('fieldset', $context).each(function(index) {
    var $nextPrev = $('<div />').appendTo($(this)).addClass("next_prev_buttons");
    if (index !== 0) {
      $nextPrev.append('<a>' + config.prevButton + '</a>').find('a:last').addClass('prev').click($.fn.wizardize.previous);
    }
    if (index < ($('fieldset', $context).length - 1)) {
      $nextPrev.append('<a>' + config.nextButton + '</a>').find('a:last').addClass('next').click($.fn.wizardize.next);
    } else {
      var submitText = $('input:submit', $context).remove().val();
      $nextPrev.append('<a>' + submitText + '</a>').find('a:last').addClass('next').addClass('submit').click(function() {
        $context.submit();
      });
    }
  });
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

  var $statusButtons = $wizardContext.find("ol:first li:not(.spacer)");

  $($statusButtons[indexToHide]).removeClass('active');
  $($statusButtons[indexToShow]).addClass('active');

  window.scroll(0,0);
};


$.fn.wizardizeMarkFieldsetAsComplete = function(index) {
  $("li:not(.spacer):nth(" + (index + 1) + ")", $(this)).addClass("enabled");
  $("fieldset:nth(" + (index + 1) + ")", $(this)).removeClass("disabled").addClass("enabled");

  $("li:not(.spacer):nth(" + index + ")", $(this)).addClass("enabled").addClass('complete');
  $("fieldset:nth(" + index + ")", $(this)).addClass("complete");
  return this;
};

$.fn.wizardizeMarkFieldsetAsIncomplete = function(index) {
  $("li:not(.spacer):gt(" + index + ")", $(this)).removeClass("enabled");
  $("fieldset:gt(" + index + ")", $(this)).removeClass("enabled").addClass("disabled");
  $("fieldset:gt(" + (index-1) + ")", $(this)).removeClass("complete");
  return this;
};

