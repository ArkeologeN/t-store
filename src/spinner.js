var Spin = (function() {
    var opts, target, spinner;
    
    function init(t) {
        opts  = {
            lines: 13, // The number of lines to draw
            length: 40, // The length of each line
            width: 17, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 0.9, // Corner roundness (0..1)
            rotate: 54, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 0.8, // Rounds per second
            trail: 50, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '200', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };
        
        target = document.getElementById(t);
        spinner = new Spinner(opts);
    }
    function start() {
        spinner.spin(target);
    }
    
    function stop() {
        spinner.stop();
    }
    
    return {
        init: init,
        start: start,
        stop: stop
    }
});