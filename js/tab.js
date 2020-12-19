$(function() {
    $(".tab li").click(function() {
        var pSection = $(this).closest('section');
        var targetNum =  pSection.find(".tab li").index(this);

        pSection.find(".tab_content").addClass('display_none');
        pSection.find(".tab_content").eq(targetNum).removeClass('display_none');
        
        pSection.find(".tab li").removeClass('select');
        $(this).addClass('select');
    });
});
