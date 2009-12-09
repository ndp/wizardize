// call like:
// before(function() { $('#fixture).fixture(); });
jQuery.fn.fixture = function() {
  this.each(function() {
    if (this.original) {
      $(this).html(this.original);
    } else {
      this.original = $(this).html();
    }
  });
}

var describe_later = function() {}
