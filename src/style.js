$(document).ready(function() {
    console.log( "ready!" );
});


$('#cars').on('shown.bs.dropdown', function () {
  
    var $this = $(this);
    // attach key listener when dropdown is shown
    $(document).keypress(function(e){
      
      // get the key that was pressed
      var key = String.fromCharCode(e.which);
      // look at all of the items to find a first char match
      $this.find("li").each(function(idx,item){
        $(item).removeClass("active"); // clear previous active item
        if ($(item).text().charAt(0).toLowerCase() == key) {
          // set the item to selected (active)
          $(item).addClass("active");
        }
      });
      
	});
  
})

// unbind key event when dropdown is hidden
$('#cars').on('hide.bs.dropdown', function () {
    $(document).unbind("keypress");
})
      $(function() {
        $("#standard").customselect();
      });
