// Var declaration
var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Selector variables
let resourceSelector;
let projectSelector;
let clientSelector;
let resourceSelectorInitialized = false;
let projectSelectorInitialized = false;
let clientSelectorInitialized = false;

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "58vh";

var dataTableOptions = {
    layout: {
        topStart: {
            buttons: [
                {extend:'colvis', text:'Ocultar/Mostrar', className: 'btn btn-dark btn-sm'},
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
        ]
        }
    },
    columnDefs:[
        {visible: false, targets:[2,3,6,7,10,12,14,15,17]}
    ],
    select: {
        style:'single'
    },
    paging: false,
    destroy: true,
    responsive:false,
    pageLength:13,    
    scrollCollapse: false,
    autoFill: false,
    scrollY: tableHeight,

    order: [],

    // Changes the styles of the default and custom buttons for Datatables
    initComplete: function () {
        //To use autofill you'll need to modify this:
        var buttons = $('.dt-button');
        buttons.removeClass('dt-button');

        var excelButton = $('.buttons-excel');
        excelButton.css('margin-right', '0');
        excelButton.css('cursor', 'default');

        var splitDropButton = $('.dt-button-split-drop');
        splitDropButton.addClass('btn btn-dark btn-sm');
        splitDropButton.css('margin-left', '1px');
    },
}

// Start DataTable 
const initDataTable = async()=>{
    if (dataTableIsinitialized) {
        dataTable.clear().destroy();
    }
    dataTable = $('#summaryDataTable').DataTable(dataTableOptions)
    dataTableIsinitialized=true;
}

// Init
$(document).ready(function(){
    setResourceList()
    setProjectList()
    setClientList()
})

// Init Select2
$(document).ready(function() {
    $('#resourceSelect').select2({
        width: '75%',
        placeholder:"Selecciona un recurso",
        tokenSeparators: [',', ' ']        
    });
    $('#projectSelect').select2({
        width: '75%',
        placeholder:"Selecciona un proyecto",
        tokenSeparators: [',', ' ']        
    });
    $('#clientSelect').select2({
        width: '75%',
        placeholder:"Selecciona un cliente",
        tokenSeparators: [',', ' ']        
    });
});

// Sets resource list
async function setResourceList(){
    var data = await getResourceList();
    let list = data.data.rows.map(element => {
        return { id: element.cmbID, text: element.cmbCompleto};
        });
    list.unshift({id:"", text: "Selecciona un recurso"});
    setResourceSelect(list);
}

// Sets project list
async function setProjectList(){
    var data = await getProjectList();
    let list = data.data.rows.map(element => {
        return { id: element.cmbID, text: element.cmbCompleto};
        });
    list.unshift({id:"", text: "Selecciona un proyecto"});
    setProjectSelect(list);
}

// Sets client list
async function setClientList(){
    var data = await getClientList();
    let list = data.data.rows.map(element => {
        return { id: element.cmbID, text: `${element.cmbDesc} - ${element.cmbCode}`};
        });
    list.unshift({id:"", text: "Selecciona un cliente"});
    setClientSelect(list);
}

// Gets the resource list
async function getResourceList(){
    let response = $.ajax({
        url: timeGetResourceListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            console.log(response);
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}

// Gets the project list
async function getProjectList(){
    let response = $.ajax({
        url: timeGetProjectListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            console.log(response);
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}

// Gets the client list
async function getClientList(){
    let response = $.ajax({
        url: timeGetClientListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            console.log(response);
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}

// Sets the resource selector options to list object
function setResourceSelect(list){
    if (resourceSelectorInitialized){
        resourceSelector.empty();
        resourceSelector.select2({
            width:'75%',
            placeholder:"Selecciona un recurso",
            data:list,
            tokenSeparators: [',', ' ']
        })
    }else{
        resourceSelector = $('#resourceSelect').select2({
            width:'75%',
            placeholder:"Selecciona un recurso",
            data:list,
            tokenSeparators: [',', ' ']
        })
        resourceSelectorInitialized = true;
    }
}

// Sets the project selector options to list object
function setProjectSelect(list){
    if (projectSelectorInitialized){
        projectSelector.empty();
        projectSelector.select2({
            width:'75%',
            placeholder:"Selecciona un proyecto",
            data:list,
            tokenSeparators: [',', ' ']
        })
    }else{
        projectSelector = $('#projectSelect').select2({
            width:'75%',
            placeholder:"Selecciona un proyecto",
            data:list,
            tokenSeparators: [',', ' ']
        })
        projectSelectorInitialized = true;
    }
}

// Sets the client selector options to list object
function setClientSelect(list){
    if (clientSelectorInitialized){
        clientSelector.empty();
        clientSelector.select2({
            width:'75%',
            placeholder:"Selecciona un cliente",
            data:list,
            tokenSeparators: [',', ' ']
        })
    }else{
        clientSelector = $('#clientSelect').select2({
            width:'75%',
            placeholder:"Selecciona un cliente",
            data:list,
            tokenSeparators: [',', ' ']
        })
        clientSelectorInitialized = true;
    }
}

// Function to hide selected options (//Needs to be fixed//)
$(document).ready(function() {
    // Function to hide selected options for a specific select2 element
    function hideSelectedOptions(select) {
        select.find('option:selected').each(function() {
            $(this).data('data-hidden', true).hide();
        });
        select.find('option:not(:selected)').each(function() {
            if ($(this).data('data-hidden')) {
                $(this).removeData('data-hidden').show();
            }
        });
        select.trigger('change.select2');
    }

    // Function to refresh the select2 options for a specific select2 element
    function refreshSelect2(select) {
        select.select2('close').select2('open');
    }

    // Apply the logic to each select2 element
    $('.custom-select').each(function() {
        var select = $(this);

        // Event when an option is selected
        select.on('select2:select', function(e) {
            hideSelectedOptions(select);
            refreshSelect2(select);
        });

        // Event when an option is deselected
        select.on('select2:unselect', function(e) {
            hideSelectedOptions(select);
            refreshSelect2(select);
        });

        hideSelectedOptions(select);
    });
});

// Submit action
$(document).ready(function() {
    $('#btnSearch').on('click', function() {
        $('#summaryTables').addClass('d-none')

        var resources = resourceSelector.val()
        var projects = projectSelector.val()
        var clients = clientSelector.val()

        var startDate = formatDate($('#startDate').val())
        var endDate = formatDate($('#endDate').val())

        var formData = {
            'resources' : resources,
            'projects' : projects,
            'clients' : clients,
            'startDate' : startDate,
            'endDate ' : endDate 
        }

        var jsonData = JSON.stringify(formData)

        // Gets summary list
        $.ajax({
           url: timeSummaryAllocationUrl,
           method: 'POST',
           headers: {'X-CSRFToken': csrfToken},
           data: jsonData,
           success: async function(response){
                console.log(response)
                data = response.data.rows
                tableData = data.map(function(key){
                    return key.cell
                })
                dataTableOptions.data = tableData
                $('#summaryTables').removeClass('d-none')
                await initDataTable()
           },
           error: function(error){
               alert(error)
           }
       })

    });
});

// Toggle display for search section
document.getElementById('searchShowToggle').addEventListener('click', function() {
    var searchContent = document.getElementById('searchContent');
    var arrowIcon = document.querySelector('#searchShowToggle i');

    if (searchContent.classList.contains('d-none')) {
        searchContent.classList.remove('d-none');
        arrowIcon.classList.remove('rotate');
    } else {
        arrowIcon.classList.add('rotate');
        searchContent.classList.add('d-none');
    }
});

// Toggle display for additional options
document.getElementById('toggleOptions').addEventListener('click', function() {
    var additionalOptions = document.getElementById('additionalOptions');
    var arrowIcon = document.querySelector('#toggleOptions i');
    
    if (additionalOptions.classList.contains('d-none')) {
        additionalOptions.classList.remove('d-none');
        arrowIcon.classList.add('rotate');
    } else {
        additionalOptions.classList.add('d-none');
        arrowIcon.classList.remove('rotate');
    }
});