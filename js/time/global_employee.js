// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "64vh"

var csrfToken = $('[name=csrfmiddlewaretoken]').val();

var dataTableOptions = {
    layout: {
        topStart: {
            buttons: [
                {extend:'colvis', text:'Ocultar/Mostrar', className: 'btn btn-dark btn-sm'},
                {extend:'pageLength',  text: "Filas", className: 'btn btn-dark btn-sm'},
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
        ]
        }
    },

    select: {
        style:'single'
    },
    paging: false,
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
        selectedDepartment = getSelectedOption()

        var formData = {
            'startDate' : startDate,
            'endDate' : endDate,
            'selectedDepartment' : selectedDepartment
        }
        
        var jsonData = JSON.stringify(formData)
         // Gets summary list
         $.ajax({
            url: timeGlobalEmployeeUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                var data = response.data;
                var headers = Object.keys(data.ColData[data.ColData.length-1]);

                var customTitles = {}

                headers.forEach(element => {
                    if(element.includes('codRecurso')){
                        customTitles[element] = element.replace('codRecurso','')
                    }else if (element.includes('ImputationDate')){
                        customTitles[element] = element.replace('ImputationDate','Fecha')
                    }else{
                    }
                });

                dataTableOptions.columns = data.ColModel.map(function(key) {
                    if (headers.includes(key.name)) {
                        return {
                            title: customTitles[key.name]|| key.name,
                            data: key.name,
                            render: function(data) {
                                return data ? data.replace(',', '.') : data;
                            }
                        };
                    } else {
                        return null;
                    }
                }).filter(function(column) {
                    return column !== null;
                });

                // Set the data for DataTables
                dataTableOptions.data = data.ColData;
                $('#summaryTables').removeClass('d-none')
                await initDataTable()
                // dataTable.columns.adjust().draw();
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
        // dataTableOptions.scrollY = tableHeight
        // initDataTable()
    } else {
        arrowIcon.classList.add('rotate');
        searchContent.classList.add('d-none');
        // dataTableOptions.scrollY = "66vh"
        // initDataTable()
    }
});