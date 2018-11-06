(function ($) {
  //TODO this.width, this.height should use attr thing
  //TODO make sure it works for more than two images
  //if on is instance of neighbours, there will be a problem with attr thing, try moving it somewhere else
  var DirectNeighbours = function (element) {
    this.one = null; 
    this.two = null; 

    this.canWorkWith = function (element) {
      if (arguments.length === 0) {
        throw 'Pass element';
      }
      if (typeof element === 'undefined') {
        throw 'Element undefined';
      }
      if (!(typeof element.height === 'function')
          || !(typeof element.width === 'function')) {
        throw 'Each element must have the height() width()';
      }
    };
    
    // this.one needs to be set before calling
    // 0 params returns the height of element one 
    // 1 param sets the height of elements one and two if available
    this.height =  function (height) {
      //because passing an element to the constructor is not mandatory, 
      //one could be undefined at call time
      if (this.one === null) {
        throw 'No element added to the collection yet, please add an element first';
      }
      if (arguments.length === 0) {
        return this.one.height();
      }
      this.one.height(height);
      if (this.two !== null) {
        this.two.height(height);
      }
    };

    // this.one needs to be set before calling
    // 0 params returns summed width of elements
    // 1 param sets new width of elements by keeping the initial width shares (ratio) they had
    this.width = function (width) {
      if (this.one === null) {
        throw 'No element added to the collection yet, please add an element first';
      }
      if (arguments.length === 0) {
        return this.one.width() + (((this.two === null) && 0) || this.two.width());
      }
      var oneOldWidth = this.one.width();
      var twoOldWdith = ((this.two === null) && 0) || this.two.width();
      var oldCumulatedWidth = oneOldWidth + twoOldWdith;
      this.one.width((oneOldWidth/oldCumulatedWidth)*width);
      (this.two !== null) && this.two.width((twoOldWidth/oldCumulatedWidth)*width);
    };

    // 
    this.add = function (element) {
      this.canWorkWith(element);

      //First element added to the collection
      if (this.one === null) {
        this.one = element;
        return;
      }

      // element param contains the third element added to the collection
      if (this.two !== null) {
        //store the old one and two in another collection and set them as this one
        this.one = new DirectNeighbours(this.one);
        this.one.add(this.two);
        this.two = null;
      }

      //for every element that is to be stored in two, figure out how to scale
      //what is in one, and what is in two, such that they both keep aspect ratio
      //and that the height is the same
      if (this.one.height() !== element.height()) {
        //tallest
        var tallest = ((this.one.height() > element.height()) && this.one) || element;
        //shortest
        var shortest = ((tallest === this.one) && element) || this.one;

        // total width = (width of both images/groups and add them up)
        // we allways want to keep the initial width
        var rectFinalWidth = tallest.width() + shortest.width();
        //shrink tallest (keeping aspect ratio) to be same height as shortest
        var heightDelta = tallest.height() - shortest.height();
        var removedWidthFromTallestToKeepItsAspectRatio = (tallest.width()/tallest.height())*heightDelta;

        //get the new width&height of "tallest" when shrinked
        //tallest and shortest have same height
        var tallestNewWidth =  tallest.width()-removedWidthFromTallestToKeepItsAspectRatio;

        //from this we can infer the size of shrinked but aligned rectangle 
        var rectShrinkedProportionalWidth = tallestNewWidth + shortest.width();
        var rectShrinkedProportionalHeight = shortest.height();

        //the width that was removed from the shrinked tallest is going to be spread proportionnally on both
        var addWidthToA = removedWidthFromTallestToKeepItsAspectRatio*(tallest.width()/rectFinalWidth);
        tallest.attr('style', function(i,s) { return s + 'width: '+ Math.floor(tallestNewWidth + addWidthToA) +'px !important;' });

        var addWidthToB = removedWidthFromTallestToKeepItsAspectRatio-addWidthToA;//removedWidthFromTallestToKeepItsAspectRatio*(shortest.width()/rectFinalWidth);
        //shortest.width(shortest.width()+addWidthToB);
        shortest.attr('style', function(i,s) { return s + 'width: '+ Math.floor(rectFinalWidth - tallest.width()) +'px !important;' });
        
        //given the aspect ratio of the rectangle, we can infer the new height for both images
        var targetHeight = Math.floor(rectShrinkedProportionalHeight+(removedWidthFromTallestToKeepItsAspectRatio*(rectShrinkedProportionalHeight/rectShrinkedProportionalWidth)));
        shortest.attr('style', function(i,s) { return s + 'height: '+ targetHeight +'px !important;' });
        tallest.attr('style', function(i,s) { return s + 'height: '+ targetHeight +'px !important;' });
      }
      this.two = element;
    };
    
    if (arguments.length === 1) {
      this.add(element);
    }
  };

  function treatImagesInsideRow(images) {
    if (images.length <= 1) {
      return true;
    }
    var st = new DirectNeighbours();
    $(images).each(function (chindex) {
      st.add($(this.img));
    });
  }

  $(document).ready(function(){
    $('.et_pb_row').each(function (index) {
      $(this).imagesLoaded(function (elem) {
        return treatImagesInsideRow(elem.images);
      });
    });
  });

})(jQuery.noConflict());
