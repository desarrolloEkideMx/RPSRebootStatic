// Var declaration
var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "60vh";

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
        {visible: false, targets:[0,1,3,5,7,9,11,12,15]}
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

// Submit action
$(document).ready(function() {
    $('#btnSearch').on('click', function() {
        $('#summaryTables').addClass('d-none');

        var year = $('#yearSelect').val();
        var startMonth = $('#startMonthSelect').val();
        var endMonth = $('#endMonthSelect').val();

        var formData = {
            'year':year,
            'startMonth':startMonth,
            'endMonth':endMonth
        }

        console.log(formData)

        var jsonData = JSON.stringify(formData)

        // Gets summary list
        $.ajax({
           url: timeCrossWorkUrl,
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