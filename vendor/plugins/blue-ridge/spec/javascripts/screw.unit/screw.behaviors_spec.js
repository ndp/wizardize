Screw.Unit(function() {
  var global_before_invoked = false, global_after_invoked = false;
  before(function() { global_before_invoked = true });
  after(function() { global_after_invoked = true });

  describe('Behaviors', function() {
    describe('#run', function() {
      describe("elapsed time", function() {
        it("displays the elapsed time after the Suite finishes", function() {
          var status = $(".status");
          status.fn("display");
          var time_elapsed_matches = /([0-9]+\.[0-9]+) seconds/.exec(status.html());
          var time_elapsed = parseFloat(time_elapsed_matches[1]);
          expect(time_elapsed > 0.0).to(be_true);
        });
      });

      describe("a simple [describe]", function() {
        it("invokes the global [before] before an [it]", function() {
          expect(global_before_invoked).to(equal, true);
          global_before_invoked = false;
        });

        it("invokes the global [before] before each [it]", function() {
          expect(global_before_invoked).to(equal, true);
          global_after_invoked = false;
        });

        it("invokes the global [after] after an [it]", function() {
          expect(global_after_invoked).to(equal, true);
        });
      });
      
      describe("a [describe] with a [before] and [after] block", function() {
        var before_invoked = false, after_invoked = false;
        before(function() { before_invoked = true });
        after(function() { after_invoked = true });
      
        describe('[after] blocks', function() {
          it("does not invoke the [after] until after the first [it]", function() {
            expect(after_invoked).to(equal, false);
          });
          
          it("invokes the [after] after the first [it]", function() {
            expect(after_invoked).to(equal, true);
            after_invoked = false;
          });
          
          it("invokes the [after] after each [it]", function() {
            expect(after_invoked).to(equal, true);
          });
        });
      
        describe('[before] blocks', function() {
          it("invokes the [before] before an it", function() {
            expect(before_invoked).to(equal, true);
            before_invoked = false;
          });
      
          it("invokes the [before] before each it", function() {
            expect(before_invoked).to(equal, true);
          });
        });
      });

      describe("A [describe] with two [before] and two [after] blocks", function() {
        var before_invocations = [], after_invocations = [];
        before(function() { before_invocations.push('before 1') });
        before(function() { before_invocations.push('before 2') });
        
        after(function() { after_invocations.push('after 1') });
        after(function() { after_invocations.push('after 2') });
        
        it("invokes the [before]s in lexical order before each [it]", function() {
          expect(before_invocations).to(equal, ['before 1', 'before 2']);
        });

        it("invokes the [afters]s in lexical order after each [it]", function() {
          expect(after_invocations).to(equal, ['after 1', 'after 2']);
        });
      });

      describe("A describe with a nested describe", function() {
        var before_invocations = [], after_invocations = [];
        before(function() {
          before_invocations = [];
          before_invocations.push("outermost before");
        });

        after(function() {
          after_invocations = [];
          after_invocations.push("outermost after");
        });
      
        it("outside a nested [describe], does not invoke any of the nested's [before]s", function() {
          expect(before_invocations).to(equal, ["outermost before"]);
        });
        
        it("outside a nested [describe], does not invoke any of the nested's [after]s", function() {
          expect(after_invocations).to(equal, ["outermost after"]);
        });
        
        describe("a nested [describe]", function() {
          before(function() {
            before_invocations.push("inner before");
          });

          after(function() {
            after_invocations.push("inner after");
          });

          it("runs [before]s in the parent [describe] before each [it]", function() {
            expect(before_invocations).to(equal, ["outermost before", "inner before"]);
          });

          it("runs [after]s in the parent [describe] after each [it]", function() {
            expect(after_invocations).to(equal, ["outermost after", "inner after"]);
          });
          
          describe("a doubly nested [describe]", function() {
            before(function() {
              before_invocations.push('innermost before');
            });

            after(function() {
              after_invocations.push('innermost after');
            });
  
            describe('[before] blocks', function() {
              it("runs [before]s in all ancestors before an [it]", function() {
                expect(before_invocations).to(equal, ["outermost before", "inner before", "innermost before"]);
              });
  
              it("runs [before]s in all ancestors before each [it]", function() {
                expect(before_invocations).to(equal, ["outermost before", "inner before", "innermost before"]);
              });
            });
            
            describe('[after] blocks', function() {
              it("runs [after]s in all ancestors after an [it]", function() {
                expect(after_invocations).to(equal, ["outermost after", "inner after", "innermost after"]);
              });
  
              it("runs [after]s in all ancestors after each [it]", function() {
                expect(after_invocations).to(equal, ["outermost after", "inner after", "innermost after"]);
              });
            });
          });
        });
      });

      // LJK: commented-out this section because it's meant to fail; but we want
      // to have a "green" build when running via continuous integration. 
      // Need to find a way to test a failure without creating a "red" build.
      //
      // describe("A describe block with exceptions", function() {
      //   var after_invoked = false;
      //   after(function() {
      //     after_invoked = true;
      //   });
      //   
      //   describe("an exception in a test", function() {
      //     it("fails because it throws an exception", function() {
      //       throw('an exception');
      //     });
      //     
      //     it("invokes [after]s even if the previous [it] raised an exception", function() {
      //       expect(after_invoked).to(equal, true);
      //     });
      //   });
      // });
    });

    describe("#selector", function() {
      describe('a [describe]', function() {
        it('manufactures a CSS selector that uniquely locates the [describe]', function() {
          $('.describe').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });

      describe('an [it]', function() {
        it('manufactures a CSS selector that uniquely locates the [it]', function() {
          $('.it').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });
    });
  });
});