$(function () {
  'use strict'

  $('[data-toggle="offcanvas"]').on('click', function () {
    $('.offcanvas-collapse').toggleClass('open');
      
if($('#offcanvas i').hasClass('fa-bars')){
   $('#offcanvas i').removeClass('fa-bars');
      $('#offcanvas i').addClass('fa-times');
   }else{
      $('#offcanvas i').removeClass('fa-times');
      $('#offcanvas i').addClass('fa-bars');
   }

  
  });
})
