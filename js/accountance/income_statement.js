var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "68vh";

var dataTableOptionsSummary = {
    columns:[
        {title: '', data: 0},
        {title: '', data: 1},
        {title: '', data: 3},
        {title: '', data: 2},
        {title: '', data: 4},
    ],
    layout: {
        topStart: {
            buttons: [
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
            ]
        }
    },
    columnDefs:[
        {orderable: false, targets:[0,1,2,3,4]},
        {visible: false, targets:[0,1]},
        {
            "targets": 2,
            "render": function(data, type){
                return capitalizeFirstLetter(data)
            }
        },
        {
            "targets": 3,
            "render": function(data, type){
                return ''+ data
            }
        },
        {
            "targets": 4,
            "render": function(data, type){
                if(data && data!=""){                    
                    return '$' + formatNumber(data,2)
                }
                return '-'
            }
        },
        { className: "dt-indent", targets: [2] },
        { className: "dt-left", targets: [3] },
    ],
    select: {
        style:'single'
    },
    rowGroup: {
        startRender: function (rows, group) {
            var total = rows
                .data()
                .pluck(4)  // Adjust the index to the column you want to sum
                .reduce(function (a, b) {
                    return a + parseFloat(b);
                }, 0);
            var secondColumnText = rows.data()[0][1];
            var secondColumnText = capitalizeFirstLetter(secondColumnText);

            return `${group} - ${secondColumnText} - $${formatNumber(total, 2)}`;
        },
        dataSrc: 0
    },
    paging: false,
    destroy: true,
    responsive:false,
    scrollCollapse: false,
    scrollY: tableHeight,
    order: [],

    // Remove the headers
    headerCallback: function(thead, data, start, end, display) {
        $(thead).remove();
    },

    // Changes the styles of the default and custom buttons for Datatables
    initComplete: function(){
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

var dataTableOptions = {
    columns:[
        {title: '', data: 0},
        {title: '', data: 1},
        {title: '', data: 2},
        {title: '', data: 3},
    ],
    layout: {
        topStart: {
            buttons: [
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
            ]
        }
    },
    columnDefs:[
        {orderable: false, targets:[0,1,2,3]},
        {visible: false, targets:[0]},
        {
            "targets": 2,
            "render": function(data, type){
                return capitalizeFirstLetter(data)
            }
        },
        {
            "targets": 3,
            "render": function(data, type){
                reformatedData = Number(data.replace(/\./g, '').replace(',','.'))
                if(reformatedData && reformatedData!=""){     
                    return '$' + formatNumber(reformatedData,2)
                }
                return '-'
            }
        },
    ],
    select: {
        style:'single'
    },
    paging: false,
    destroy: true,
    responsive:false,
    scrollCollapse: false,
    scrollY: tableHeight,
    order: [],

    // Remove the headers
    headerCallback: function(thead, data, start, end, display) {
        $(thead).remove();
    },

    // Changes the styles of the default and custom buttons for Datatables
    initComplete: function(){
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

// Select All button in multi select
$(document).ready(function() {
    monthSelect = $('#monthSelect').select2({width: '80%'});
    // Add Select All Button
    var selectAllOption = '<option value="select_all">Select All</option>';
    monthSelect.prepend(selectAllOption);

    monthSelect.on('select2:select', function(element) {
        if (element.params.data.id === 'select_all') {
            // Select all options
            monthSelect.find('option:not([value="select_all"])').prop('selected', true);
            monthSelect.trigger('change');
        }
    });
    monthSelect.on('select2:unselect', function(element) {
        if (element.params.data.id === 'select_all') {
            // Deselect all options
            monthSelect.find('option').prop('selected', false);
            monthSelect.trigger('change');
        }
    });
});

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')

        year = $('#yearSelect').val()
        months = monthSelect.val()
        isAccumulated = $('#btncheck1').is(':checked')

        formData = {
            'year':year,
            'months':months,
            'isAccumulated':isAccumulated,
        }
        jsonData = JSON.stringify(formData)

        $.ajax({
            url: accountanceIncomeStatementUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                data = response.data

                tableDataSummary = data[0].map(function(key){ return key.cell })
                dataTableOptionsSummary.data = tableDataSummary
                
                tableData = data[1].map(function(key){ return key.cell })
                dataTableOptions.data = tableData

                $('#summaryTables').removeClass('d-none')
                $('#summaryDataTable1').DataTable(dataTableOptionsSummary);
                $('#summaryDataTable2').DataTable(dataTableOptions); 
                // await initDataTable()
            },
            error: function(error){
                alert(error)
            },
        })
    })
})


// Toggle display for search section
$('#searchShowToggle').on('click', function() {
    var $searchContent = $('#searchContent');
    var $arrowIcon = $('#searchShowToggle i');

    if ($searchContent.hasClass('d-none')) {
        $searchContent.removeClass('d-none');
        $arrowIcon.removeClass('rotate');
    } else {
        $arrowIcon.addClass('rotate');
        $searchContent.addClass('d-none');
    }
});
