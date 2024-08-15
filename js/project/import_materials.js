var csrfToken = $('[name=csrfmiddlewaretoken]').val();
let projectSelector;
let projectSelectorInitialized = false;
let file
let projectLists = []

// Handles file upload
$(document).ready(function() {
    $('#inputFile').on('change', function() {
        selectedProject = projectSelector.val()
        file = this.files[0]
        $('#inputFileLabel').contents().filter(function() {
            return this.nodeType === 3; // Node type 3 is a text node
        }).first().replaceWith(file.name);

        if (file != null && projectSelector.val() != ""){
            $("#btnSubmit").prop("disabled", false);
        }
    });
    $('#projectSelect').on('change', function(){  
        if (file != null && projectSelector.val() != ""){
            $("#btnSubmit").prop("disabled", false);
        }
    })
  });

// Submit action
$(document).ready(function() {
    $('#btnSubmit').on('click', function() {
        $('#resultSection').addClass('d-none')
        var formData = new FormData($('#materialListUploadForm')[0]);
        
        var inputFile = $('#inputFile')[0].files[0];
        formData.append('inputFile', inputFile);

        $.ajax({
        url: projectImportMaterialsUrl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            $('#resultSection').removeClass('d-none')
            $('#uploadStatus').removeClass('alert-danger');
            $('#uploadStatus').addClass('alert-success');

            console.log(response)
            $('#uploadStatus').html(`<p>${response.data}</p>`);
        },
        error: function(response) {
            $('#resultSection').removeClass('d-none')
            $('#uploadStatus').removeClass('alert-success');
            $('#uploadStatus').addClass('alert-danger');
            errorString = response.responseJSON.data.replace(/:/g, ':\n' + '  ')
            $('#uploadStatus').html(`<p>Error: ${errorString}</p>`);
            console.log(errorString)
        }
        });
    });
});

// Init Select2
$(document).ready(function() {
    $('#projectSelect').select2({
        width: '75%',
        placeholder:"Selecciona un proyecto"        
    });
});

// Init
$(document).ready(function(){
    var projectType = getSelectedOption()
    setProjectLists(projectType)
})

// Set project lists
async function setProjectLists(type){
    if(projectLists[type-1]==null){
        var data = await getProjectList(type);

        let list = data.data.map(element => {
            return { id: element[0], text: element[1] + " - " + element[2] };
            });

        list.unshift({id:"", text: "Selecciona un proyecto"});
            
        projectLists[type-1] = list;
        setProjectSelect(list);
    }else{
        setProjectSelect(projectLists[type-1]);
    }
}

// Gets the selected project list
async function getProjectList(type){
    var projectType = type
    var formData = {
        'projectType' : projectType,
    }
    var jsonData = JSON.stringify(formData);
    let data = $.ajax({
        url: projectTypeListUrl,
        method: 'POST',
        headers: {'X-CSRFToken': csrfToken},
        data: jsonData,
        success: function(response){
            console.log(response);
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return data
}

// Sets the selector options to list object
function setProjectSelect(list){
    if (projectSelectorInitialized){
        projectSelector.empty();
        projectSelector.select2({
            width:'75%',
            placeholder:"Selecciona un proyecto",
            data:list
        })
    }else{
        projectSelector = $('#projectSelect').select2({
            width:'75%',
            placeholder:"Selecciona un proyecto",
            data:list
        })
        projectSelectorInitialized = true;
    }

}

// Get selected option
function getSelectedOption(){
    const options = document.getElementsByName('projectType');
    for (const option of options){
        if(option.checked){
            return option.value;
        }
    }
}

// Listens for change in radio buttons
$(document).ready(function() {
    $('input[name="projectType"]').change(function() {
        var projectType = getSelectedOption()
        setProjectLists(projectType);
    });
  });