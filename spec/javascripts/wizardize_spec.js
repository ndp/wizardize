require("spec_helper.js");
require("../../public/javascripts/jquery/jquery.wizardize.js");

Screw.Unit(function() {
  var control;
  before(function() {
    control = $('#control').html();
  });

  after(function() {
    expect($('#control').html()).to(equal, control);
  });

  before(function() {
    $('#fixture').fixture();
  });

  describe('wizardize plugin', function() {
    var $statusButtons;

    it('should return the jQuery object passed in', function() {
      $form = $('form#main');
      expect($form.wizardize()).to(equal, $form);
    });

    describe('(using defaults)', function() {
      before(function() {
        $('form#main').wizardize();
      });

      before(function() {$statusButtons = $('form#main ol:first');});

      it('should add a "wizardized" class to this', function() {
        $('form#main').hasClass('wizardized');
      });

      it('should initialize all fieldsets to not complete', function() {
        expect($('form#main fieldset.complete').length).to(equal, 0);
      });

      it('should add the enabled class to the first fieldset', function() {
        expect($('form#main fieldset:first').hasClass('enabled')).to(equal, true);
      });

      it('should have only 1 enabled fieldset', function() {
        expect($('form#main fieldset.enabled')).to(have_length, 1);
      });

      it('should have no complete status buttons', function() {
        expect($statusButtons.find('li.complete')).to(have_length, 0);
      });


      describe('marking the first fieldset as complete', function() {
        before(function() {
          $('form#main').wizardizeMarkFieldsetAsComplete(0);
        });
        it('should enable the 2nd status button', function() {
          expect($('form#main ol li:not(.wzdr_spacer):nth(1)').hasClass("enabled")).to(equal, true);
        });
        describe('marking the second fieldset as complete', function() {
          before(function() {
            $('form#main').wizardizeMarkFieldsetAsComplete(1);
          });
          it('should enable the 3nd status button', function() {
            expect($('form#main ol li:not(.wzdr_spacer):nth(2)').hasClass("enabled")).to(equal, true);
          });
          describe("marking the first fieldset as incomplete", function() {
            before(function() {
              $('form#main').wizardizeMarkFieldsetAsIncomplete(0);
            });
            it('should remove the enabled class from the 3rd fieldset', function() {
              expect($('form#main fieldset:nth(2)').hasClass("enabled")).to(equal, false);
            });
            it('should remove the enabled class from the 3rd status button', function() {
              expect($('form#main ol li:not(.wzdr_spacer):nth(2)').hasClass("enabled")).to(equal, false);
            });
          });
        });
      });

      describe('marking the first fieldset as incomplete', function() {
        before(function() {
          $('form#main').wizardizeMarkFieldsetAsIncomplete(0);
        });
        it('should remove the enabled class from the 2nd status button', function() {
          expect($('form#main ol li:not(.wzdr_spacer):nth(1)').hasClass("enabled")).to(equal, false);
        });

        it('should remove the enabled class from the 2nd fieldset', function() {
          expect($('form#main fieldset:nth(1)').hasClass("enabled")).to(equal, false);
        });
      });


      describe('navigation', function() {
        describe('status buttons', function() {
          it("should extract fieldset titles into list", function() {
            expect($statusButtons.find('li').text()).to(equal, 'RowShamBeau');
          });
          it("should mark first panel's button as 'active'", function() {
            expect($statusButtons.find('li:first').hasClass('active')).to(equal, true);
          });
          it("should mark only one button as active", function() {
            expect($statusButtons.find('li.active')).to(have_length, 1);
          });
          it("should mark no buttons as complete", function() {
            expect($statusButtons.find('li.complete')).to(have_length, 0);
          });
          it("should mark only the first button as enabled", function() {
            expect($statusButtons.find('li:first').hasClass("enabled")).to(equal, true);
          });
          it("should mark only one button as enabled", function() {
            expect($statusButtons.find('li.enabled')).to(have_length, 1);
          });


          describe('clicks from the second fieldset', function() {
            before(function() {
              expect($("form#main fieldset:first").is(":visible")).to(equal, true);
              expect($("form#main fieldset:nth(1)").is(":hidden")).to(equal, true);
              $("form#main").wizardizeMarkFieldsetAsComplete(0);
              $("form#main fieldset:first a.next").click();
              expect($statusButtons.find('li.complete')).to(have_length, 1);

              expect($("form#main fieldset:first").is(":hidden")).to(equal, true);
              expect($("form#main fieldset:nth(1)").is(":visible")).to(equal, true);
            });


            describe('on the first status button', function() {
              before(function() {
                $statusButtons.find("li:first").click();
              });
              it("should allow me to go back to the first fieldset", function() {
                expect($("form#main fieldset:first")).to(match_selector, ":visible");
              });

              it("should hide the 2nd fieldset", function() {
                expect($("form#main fieldset:nth(1)").is(":hidden")).to(equal, true);
              });

              it("should mark first panel's button as 'active'", function() {
                expect($statusButtons.find('li:first').hasClass('active')).to(equal, true);
              });

              it("should mark only one button as active", function() {
                expect($statusButtons.find('li.active')).to(have_length, 1);
              });

              it("should leave the first button marked 'complete'", function() {
                expect($statusButtons.find('li.complete')).to(have_length, 1);
              });

              it("should mark the first button as enabled", function() {
                expect($statusButtons.find('li:first').hasClass("enabled")).to(equal, true);
              });

              it("should mark the second button as enabled", function() {
                expect($statusButtons.find('li:not(.wzdr_spacer):nth(1)').hasClass("enabled")).to(equal, true);
              });

            });

            describe('on the 3rd status button', function() {

              describe("when the 3rd fieldset is not enabled", function() {
                before(function() {
                  $("form#main ol:first li:nth(2)").click();
                });
                it("should not allow me to go to the 3rd fieldset", function() {
                  expect($("form#main fieldset:nth(2)").is(":hidden")).to(equal, true);
                });

                it("should keep me on the 2nd fieldset", function() {
                  expect($("form#main fieldset:nth(1)").is(":visible")).to(equal, true);
                });

              });

              describe("when the 3rd fieldset is enabled", function() {

                before(function() {
                  $("form#main").wizardizeMarkFieldsetAsComplete(1);
                  $("form#main ol:first li:nth(2)").click();
                });

                it("should allow me to go to the 3rd fieldset", function() {
                  expect($("form#main fieldset:nth(2)").is(":visible")).to(equal, true);
                });

                it("should hide the 2nd fieldset", function() {
                  expect($("form#main fieldset:nth(1)").is(":hidden")).to(equal, true);
                });

              });

            });
          });

        });

        describe("submit link", function() {
          it("should not show up on the first fieldset", function() {
            expect($("form#main fieldset:first input:submit")).to(have_length, 0);
          });
          it("should not show up on the second fieldset", function() {
            expect($("form#main fieldset:nth(1) input:submit")).to(have_length, 0);
          });
          it("should show up on the last screen", function() {
            expect($("form#main fieldset:last a.submit")).to(have_length, 1);
          });

          it("should be moved to the same div as the prev button", function() {
            expect($("form#main fieldset:last div.next_prev_buttons a.submit")).to(have_length, 1);
          });

          it("should have class next", function() {
            expect($("form#main fieldset:last div.next_prev_buttons a.submit.next")).to(have_length, 1);
          })

          it("should have the same text as the original input:submit", function() {
            expect($("form#main fieldset:last div.next_prev_buttons a.submit.next").text()).to(equal, "Submit Me");

          })
        })

        describe('next/prev buttons', function() {
          it("should get their own div", function() {
            expect($("form#main fieldset:first div.next_prev_buttons").text()).to(equal, 'Next');
          });
          it("should add 'next' button to first fieldset", function() {
            expect($("form#main fieldset:first a").text()).to(equal, 'Next');
          });
          it("should add 'next' class to next button", function() {
            expect($("form#main fieldset:first a").hasClass('next')).to(equal, true);
          });
          it("should add 'next' and 'prev' buttons to second fieldset", function() {
            expect($("form#main fieldset:nth(1) a:first").text()).to(equal, 'Previous');
            expect($("form#main fieldset:nth(1) a:last").text()).to(equal, 'Next');
          });
          it("should add 'prev' buttons to last fieldset", function() {
            expect($("form#main fieldset:last a").text()).to(match, /Previous/);
          });
          it("should add 'prev' class to previous button", function() {
            expect($("form#main fieldset:last a").hasClass('prev')).to(equal, true);
          });

          describe("hitting next button", function() {
            var preventDefaultWasCalled = false;

            before(function() {
              // Simulate: $('form#main fieldset:visible a:contains("Next")').click();
              $("form#main").wizardizeMarkFieldsetAsComplete(0);
              var event = {preventDefault: function() {
                preventDefaultWasCalled = true
              }};
              $.fn.wizardize.next.apply($('form#main fieldset:visible a:contains("Next")').get(0), [event]);
            });
            it('should call preventDefault on the event', function() {
              expect(preventDefaultWasCalled).to(equal, true);
            });
            it("should hide first fieldset", function() {
              expect($('form#main fieldset:first').is(':visible')).to(equal, false);
            });
            it("should show second fieldset", function() {
              expect($('form#main fieldset:nth(1)').is(':visible')).to(equal, true);
            });
            it("should mark first fieldset as 'complete'", function() {
              expect($statusButtons.find('li:first').hasClass('complete')).to(equal, true);
            });
            it("should mark first fieldset as not 'active'", function() {
              expect($statusButtons.find('li:first').hasClass('active')).to(equal, false);
            });
            it("should mark second fieldset as 'active'", function() {
              expect($statusButtons.find('li:nth(1)').hasClass('active')).to(equal, true);
            });
            describe("and then hitting previous button", function() {
              before(function() {
                $('form#main fieldset:visible a:contains("Previous")').click();
              });
              it("should show first fieldset", function() {
                expect($('form#main fieldset:first').is(':visible')).to(equal, true);
              });
              it("should hide second fieldset", function() {
                expect($('form#main fieldset:nth(1)').is(':visible')).to(equal, false);
              });
              it("should leave first button as 'complete'", function() {
                expect($statusButtons.find('li:first').hasClass('complete')).to(equal, true);
              });
              it("should mark first fieldset as 'active'", function() {
                expect($statusButtons.find('li:first').hasClass('active')).to(equal, true);
              });
              it("should mark second fieldset as 'active'", function() {
                expect($statusButtons.find('li:nth(1)').hasClass('active')).to(equal, false);
              });
            });

          });
        });
      });
      describe('panel visibility', function() {
        it("should hide the last field set", function() {
          expect($('form#main fieldset:last').is(':visible')).to(equal, false);
        });
        it("should hide the second field set", function() {
          expect($('form#main fieldset:nth(1)').is(':visible')).to(equal, false);
        });
        it("should not hide the first field set", function() {
          expect($('form#main fieldset:first').is(':visible')).to(equal, true);
        });
      });
    })

    describe('with options', function() {

      describe('configuring buttons', function() {
        before(function() {
          $('form#main').wizardize({
            nextButton: 'continue',
            prevButton: 'go back'});
          $statusButtons = $('form#main ol:first');
        });
        it("should add custom button name to next", function() {
          expect($("form#main fieldset:first a").text()).to(equal, 'continue');
        });
        it("should add custom button name to previous", function() {
          expect($("form#main fieldset:last a").text()).to(match, /go back/);
        });

      });

      describe('setting the status button template', function() {
        before(function() {
          $('form#main').wizardize({
            statusButtonsTemplate: 'STEP $#: $TITLE'});
          $statusButtons = $('form#main ol:first');
        });
        it("should customize status buttons", function() {
          expect($statusButtons.find('li:first').text()).to(equal, 'STEP 1: Row');
        });
        it("should customize last status buttons", function() {
          expect($statusButtons.find('li:last').text()).to(equal, 'STEP 3: Beau');
        });

      });

      describe('setting the status button template function', function() {
        before(function() {
          $('form#main').wizardize({
            statusButtonTemplateFunction: function(stepNumber, title) {
              return 'step = $#, title = $TITLE'.replace(/\$#/, stepNumber).replace(/\$TITLE/, title);
            }
          });
          $statusButtons = $('form#main ol:first');
        });
        it("should customize status buttons", function() {
          expect($statusButtons.find('li:first').text()).to(equal, 'step = 1, title = Row');
        });
        it("should customize last status buttons", function() {
          expect($statusButtons.find('li:last').text()).to(equal, 'step = 3, title = Beau');
        });

      });

      describe('using status button spacers', function() {
        before(function() {
          $('form#main').wizardize({
            statusButtonsSpacer: '::'});
          $statusButtons = $('form#main ol:first');
        });
        describe('regular spacer', function() {
          it("should extract fieldset titles into list", function() {
            expect($statusButtons.find('li').text()).to(equal, 'Row::Sham::Beau');
          });
          it("should output first li normally", function() {
            expect($statusButtons.find('li:first').text()).to(equal, 'Row');
          });
          it("should insert spacers between steps 1 and 2", function() {
            expect($statusButtons.find('li:nth(1)').text()).to(equal, '::');
          });
          it("should have a 'spacer' class", function() {
            expect($statusButtons.find('li:nth(1)').hasClass('wzdr_spacer')).to(equal, true);
          });
          it("should insert spacers between steps 2 and 3", function() {
            expect($statusButtons.find('li:nth(3)').text()).to(equal, '::');
          });
          it("should not insert spacers after step 3", function() {
            expect($statusButtons.find('li:last').text()).to(equal, 'Beau');
          });
          describe("hitting next button", function() {
            var preventDefaultWasCalled = false;
            var event = {preventDefault: function() {
              preventDefaultWasCalled = true
            }};

            before(function() {
              // Simulate: $('form fieldset:visible a:contains("Next")').click();
              $("form#main").wizardizeMarkFieldsetAsComplete(0);
              $.fn.wizardize.next.apply($('form#main fieldset:visible a:contains("Next")').get(0), [event]);
            });
            it('should call preventDefault on the event', function() {
              expect(preventDefaultWasCalled).to(equal, true);
            });
            it("should mark first statusButton as 'complete'", function() {
              expect($statusButtons.find('li:first').hasClass('complete')).to(equal, true);
            });
            it("should mark first statusButton as not 'active'", function() {
              expect($statusButtons.find('li:first').hasClass('active')).to(equal, false);
            });
            it("should mark second statusButton as 'active'", function() {
              expect($statusButtons.find('li:nth(2)').hasClass('active')).to(equal, true);
            });
            describe("and then hitting previous button", function() {
              before(function() {
                //$('form fieldset:visible a:contains("Previous")').click();
                $.fn.wizardize.previous.apply($('form#main fieldset:visible a:contains("Previous")').get(0), [event]);
              });
              it("should leave first statusButton as  'complete'", function() {
                expect($statusButtons.find('li:first').hasClass('complete')).to(equal, true);
              });
              it("should mark first statusButton as 'active'", function() {
                expect($statusButtons.find('li:first').hasClass('active')).to(equal, true);
              });
              it("should mark second statusButton as 'active'", function() {
                expect($statusButtons.find('li:nth(2)').hasClass('active')).to(equal, false);
              });
              it("should mark second statusButton as 'active'", function() {
                expect($statusButtons.find('li:nth(4)').hasClass('active')).to(equal, false);
              });
            });

          });

        });
        describe('entity spacer', function() {
          before(function() {
            $('form#main').wizardize({
              statusButtonsSpacer: '&#187;'});
            $statusButtons = $('form#main ol:first');
          });
          it("should extract fieldset titles into list", function() {
            expect($statusButtons.find('li').text()).to(equal, $('<span>Row&#187;Sham&#187;Beau</span>').text());
          });
          it("should insert entity between steps 1 and 2", function() {
            expect($statusButtons.find('li:nth(1)').text()).to(equal, $('<span>&#187;</span>').text());
          });
        });


      });

      describe('"next" callback click', function() {
        var fieldsetIndex = null;
        var fieldsetCallbackThis = null;
        before(function() {
          $('form#main').wizardize({
            nextCallback: function(i) {
              fieldsetIndex = i;
              fieldsetCallbackThis = this;
            }
          });
          $statusButtons = $('form#main ol:first');
          $("form#main").wizardizeMarkFieldsetAsComplete(0);
          $("form#main").wizardizeMarkFieldsetAsComplete(1);
        });
        it("should call with correct index", function() {
          $('form#main fieldset:visible a.next').click();
          expect(fieldsetIndex).to(equal, 1);
        });
        it("should call with another index", function() {
          $('form#main fieldset:visible a.next').click();
          $('form#main fieldset:visible a.next').click();
          expect(fieldsetIndex).to(equal, 2);
        });
        it("should call with context of fieldset", function() {
          $('form#main fieldset:visible a.next').click();
          expect(fieldsetCallbackThis).to(equal, $('form#main fieldset:nth(1)').get(0));
        });
        it("should call with context of another fieldset", function() {
          $('form#main fieldset:visible a.next').click();
          $('form#main fieldset:visible a.next').click();
          expect(fieldsetCallbackThis).to(equal, $('form#main fieldset:last').get(0));
        });

      });

      describe("extra validation for step", function() {
        var fieldsetValid;
        var fieldset;
        before(function() {
          $('form#main').wizardize({
            validateFieldset: function() {
              fieldset = this;
              if (fieldsetValid) {
                $(this).addClass("complete");
              }
              return fieldsetValid;
            }
          });
          $statusButtons = $('form#main ol:first');
        });
        it("should not proceed if validation fails", function() {
          expect($("form#main fieldset:nth(0)").is(":visible")).to(equal, true);
          fieldsetValid = false;
          $('form#main fieldset:visible a.next').click();
          expect($("form#main fieldset:nth(0)").is(":visible")).to(equal, true);
        });
        it("should proceed if validation passes", function() {
          fieldsetValid = true;
          expect($("form#main fieldset:nth(0)").is(":visible")).to(equal, true);
          $('form#main fieldset:visible a.next').click();
          expect($("form#main fieldset:nth(1)").is(":visible")).to(equal, true);
        });
        it("passes the proper fieldset to the validation function", function() {
          fieldsetValid = true;
          $('form#main fieldset:visible a.next').click();
          expect(fieldset).to(equal, $("form#main fieldset:nth(0)").get(0));
          $('form#main fieldset:visible a.next').click();
          expect(fieldset).to(equal, $("form#main fieldset:nth(1)").get(0));
        });
      });
    });

  });
});