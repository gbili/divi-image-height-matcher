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
        this.height =  function () {
            //because passing an element to the constructor is not mandatory, 
            //one could be undefined at call time
            if (this.one === null) {
                throw 'No element added to the collection yet, please add an element first';
            }
            //if there is a two it is of same height anyways
            return this.one.height();
        };

        // Only pass height and width which keep aspect ratio
        // Sets width and height, of elements one and two recursively if needed
        // by keeping aspect ratios
        this._size = function(height, width) {
            if (this.two === null) {
                throw 'Dont set _size untill there are two els';
            }

            var oneWidthShare = (width * this.one.width())/(this.one.width() + this.two.width());
            var twoWidthShare = width - oneWidthShare;

            if (this.one instanceof DirectNeighbours) {
                this.one._size(height, oneWidthShare);
            } else {
                this.one.height(height);
                this.one.width(oneWidthShare);
            }

            this.two.height(height);
            this.two.width(twoWidthShare);
        };

        // this.one needs to be set before calling
        // 0 params returns summed width of elements
        this.width = function () {
            if (this.one === null) {
                throw 'No element added to the collection yet, please add an element first';
            }
            return this.one.width() + (((this.two === null) && 0) || this.two.width());
        };

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

            if (this.one.height() !== element.height()) {
                this._matchHeightsBeforeAdd(element);
            }
            //elements are occupying full width available in row and have same height
            //keeping aspect ratio
            this.two = element;
        };

        //for every element that is to be stored in two, figure out how to scale down
        //the tallest (between this.one and element) such that both keep aspect ratio
        //and that the height is the same
        this._matchHeightsBeforeAdd = function (element) {
            var tallest = ((this.one.height() > element.height()) && this.one) || element;
            var shortest = ((tallest === this.one) && element) || this.one;

            // total width = (width of both images/groups and add them up)
            // we allways want to keep the initial width
            var rectFinalWidth = tallest.width() + shortest.width();

            //shrink tallest (keeping aspect ratio) to be same height as shortest
            var heightDelta = tallest.height() - shortest.height();
            var removedWidthFromTallestToKeepItsAspectRatio = (tallest.width() * heightDelta) / tallest.height();
            var tallestTempWidth =  tallest.width() - removedWidthFromTallestToKeepItsAspectRatio;

            //from this we can infer the size of shrinked but aligned rectangle 
            //there should be empty space with these sizes, we will fill it up now
            //by scaling each shape that has the same hight now
            var tempShrinkedHeights = shortest.height();

            // comes from equation of two lines, corresponding to the diagonals of each rectangle meeting at some point
            // y = hx/b and y = -hx/d + wh/d solve for x, where b and d are width of each rect and w final width
            // <=> x = wb/(d+b) and x is the initially-tallest final width
            var tallestFinalWidth = (rectFinalWidth * tallestTempWidth) / (tallestTempWidth + shortest.width());
            var shortestFinalWidth = rectFinalWidth - tallestFinalWidth;
            var finalHeight = (tempShrinkedHeights * tallestFinalWidth) / tallestTempWidth;

            //if one of them is instance of this set it in block
            if (tallest instanceof DirectNeighbours) {
                tallest._size(finalHeight, tallestFinalWidth);
                shortest.height(finalHeight);
                shortest.width(shortestFinalWidth);
            } else if (shortest instanceof DirectNeighbours) {
                shortest._size(finalHeight, shortestFinalWidth);
                tallest.height(finalHeight);
                tallest.width(tallestFinalWidth);
            } else {
                shortest.height(finalHeight);
                shortest.width(shortestFinalWidth);
                tallest.height(finalHeight);
                tallest.width(tallestFinalWidth);
            }
        };

        this._setElStyle = function (el, widthOrHeight, val) {
            el.attr('style', function(i,s) { return s + widthOrHeight + ': '+ Math.floor(val) +'px !important;';});
        };

        if (arguments.length === 1) {
            this.add(element);
        }
    };


    function treatImagesInsideRow(images) {
        // do not alter rows that have a single image
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
