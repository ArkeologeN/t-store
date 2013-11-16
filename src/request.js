var APIRequest = {}
APIRequest.loadCategories =  function(cb) {
	$.ajax({
		url: "http://mysma.gnstudio.biz/index.php?route=feed/web_api/categories&parent=0&level=2",
		success: function(data) {
                    if (typeof data === 'string') {
                            cb($.parseJSON(data));
                    } else {
                            cb(data);
                    }
		},
		error: function() {
                    console.log(arguments);
		}
	});
}
APIRequest.loadSubCategories = function(cb) {
	$.ajax({
		url: "http://mysma.gnstudio.biz/index.php?route=feed/web_api/categories&parent="+activeCat+"&level=2",
		success: function(data) {
			if (typeof data === 'string') {
                            cb($.parseJSON(data));
                    } else {
                            cb(data);
                    }
		},
		error: function() {
                    cb(arguments);
		}
	});
}
