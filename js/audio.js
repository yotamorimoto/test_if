$(function(){
    $('audio').each(function(index, elenment){
        elenment.addEventListener("play",function(){
            $('audio').each(function(i2, e2){
                if(index!=i2){
                    e2.pause();
                    e2.currentTime = 0;
                }
            });
        });
    });
});
      