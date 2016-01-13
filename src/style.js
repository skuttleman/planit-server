$(document).ready(function() {
    console.log( "ready!" );
});



$('.planit-dropdown').on('dropdown-menu', function () {
	console.log('hello')
  
    var $this = $(this);
    // attach key listener when dropdown is shown
    $(document).keypress(function(e){
      
      // get the key that was pressed
      var key = String.fromCharCode(e.which);
      // look at all of the items to find a first char match
      $this.find("li").each(function(idx,item){
        $(item).removeClass("keybind-dropdown"); // clear previous active item
        if ($(item).text().charAt(0).toLowerCase() == key) {
          // set the item to selected (active)
          $(item).addClass("keybind-dropdown");
        }
      });
      
	});
  
})

// unbind key event when dropdown is hidden
$('.planit-dropdown').on('dropdown-menu', function () {
    $(document).unbind("keypress");
})