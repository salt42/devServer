function init(){
    $('.activeButton').click(function(e){
        var id = $(this).parents('li')[0]
        id = $(id).attr('class')
        id = id.match( /[0-9]/ )[0];
        $.ajax({
            type : "GET",
            url : '/SERVER/switch/'+id,
            success : function(e){
                updateActiveHost(e.id)
            },
        });
    })
    updateActiveHost(activeHost)
}
function updateActiveHost(id){
    activeHost = parseInt(id)
    //render
    $('#projectList li.active').removeClass('active')
    $('#projectList li.id_'+activeHost).addClass('active')
}
