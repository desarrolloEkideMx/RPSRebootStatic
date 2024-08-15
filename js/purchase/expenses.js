// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "60vh";

var csrfToken = $('[name=csrfmiddlewaretoken]').val();

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
        {visible: false, targets:[0,2,4,6,14,15,17]},
        {
            "targets": 9,
            "render": function(data, type){
                if(data){
                    const monthNames = [
                        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                    ];
                    
                    // Subtract 1 from monthNumber to get the correct index (0-11)
                    return monthNames[data - 1];
                }
                return data

                
            }
        },
        {
            "targets": [10,12],
            "render": function(data, type){
                if(data){
                    return '$' + parseFloat(data).toFixed(2)
                }
                return data
            }
        },
        {
            "targets": 11,
            "render": function(data, type){
                if(data){
                    return data + '%'
                }
                return data
            }
        },
        {
            "targets": 13,
            "render": function(data, type){
                if(data){
                    return "<div style='text-align:center;'><i class='bx bxs-check-circle' style='color: green;'></i></div>";
                }
                return "<div style='text-align:center;'><i class='bx bxs-x-circle' style='color: red;'></i></div>";
            }
        },
    ],

    select: {
        style:'single'
    },
    paging: true,
    destroy: true,
    responsive:true,
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

// Search submit
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')
        startDate = formatDate($('#startDate').val())     
        endDate = formatDate($('#endDate').val())  
        var formData = {
            'startDate' : startDate,
            'endDate' : endDate,
        }
        var jsonData = JSON.stringify(formData)
        
        // Gets summary list
         $.ajax({
            url: purchaseGetExpenseUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                var data = response.data.rows;
                tableData = data.map(function(key){ return key.cell })
                dataTableOptions.data = tableData
                $('#summaryTables').removeClass('d-none')
                await initDataTable()
            },
            error: function(error){
                alert(error)
            }
        })
    })
})

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