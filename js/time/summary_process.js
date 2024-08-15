// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "64vh";

var csrfToken = $('[name=csrfmiddlewaretoken]').val();

var dataTableOptions = {
    layout: {
        topStart: {
            buttons: [
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

        var formData = {
            'startDate' : startDate,
            'endDate' : endDate,
        }
        
        var jsonData = JSON.stringify(formData)
         // Gets summary list
         $.ajax({
            url: timeSummaryProcessUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                var data = response.data;
                console.log(data)
                var headers = data.ColNames
                headers[0]='Actividades'
                dataTableOptions.columns = data.ColModel.map(function(key, index) {
                    return {
                        title: headers[index].replace('UCp-',''),
                        data: key.index,
                        render: function(data) {
                            formattedData = data.replace('h','h | ').replace('%','% | ')
                            return formattedData;
                        } 
                    };
                })
                // Set the data for DataTables
                dataTableOptions.data = data.ColData;
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
        // dataTableOptions.scrollY = tableHeight
        // initDataTable()
    } else {
        arrowIcon.classList.add('rotate');
        searchContent.classList.add('d-none');
        // dataTableOptions.scrollY = "66vh"
        // initDataTable()
    }
});