var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "60vh";

var dataTableOptions = {
    columns:[
        {title: '', data: 0},
        {title: 'Cuenta', data: 1},
        {title: 'N. Cuenta Padre', data: 2},
        {title: 'Cuenta Padre', data: 3},
        {title: 'Debe', data: 4},
        {title: 'Haber', data: 5},
        {title: 'Importe', data: 6},
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
        {orderable: false, targets:[0,1,2,3,4,5,6]},
        {visible: false, targets:[2,3]},
        {
            "targets": 1,
            "render": function(data, type){
                return capitalizeFirstLetter(data)
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
        {
            "targets": 5,
            "render": function(data, type){
                if(data && data!=""){                    
                    return '$' + formatNumber(data,2)
                }
                return '-'
            }
        },
        {
            "targets": 6,
            "render": function(data, type){
                if(data && data!=""){                    
                    return '$' + formatNumber(data,2)
                }
                return '-'
            }
        },
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
            var secondColumnText = rows.data()[0][3];
            var secondColumnText = capitalizeFirstLetter(secondColumnText);

            return `${group} - ${secondColumnText} - $${formatNumber(total, 2)}`;
        },
        dataSrc: 2
    },
    paging: false,
    destroy: true,
    responsive:false,
    scrollCollapse: false,
    scrollY: tableHeight,
    order: [],

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

// Select Init
const selects = {
    supplierSelect: { init: false, selector: '#supplierSelect', width: '65%', url: accountanceGetSupplierListUrl},
    accountSelect: { init: false, selector: '#accountSelect', width: '70%', url: accountanceGetAccountListUrl},
};

// Generic function to set a regular select
async function setSelectList(selectName){
    const selectInfo = selects[selectName];
    const data = await getList(selectInfo.url);
    var list
    if (selectName == 'supplierSelect'){
        list = data.data.map(element => ({
            id: element.cmbId,
            text: element.cmbDesc + ' - ' + element.cmbCode
        }));
    }else{
        list = data.data.map(element => ({
            id: element.cmbId,
            text: element.cmbCompleto
        }));
    }
    setSelect(selectName, list);
}
// Gets call for lists  
async function getList(url){
    try {
        const response = await $.ajax({
            url: url,
            method: 'GET',
            headers: { 'X-CSRFToken': csrfToken },
        });
        return response;
    } catch (error) {
        alert(error);
        throw error;
    }
}
// Generic function to set regular selects
function setSelect(selectName, list){
    const selectInfo = selects[selectName];
    if (selectInfo.init) $(selectInfo.selector).empty();

    $(selectInfo.selector).select2({       
        width: selectInfo.width,
        placeholder: "Selecciona una opción",
        data: list,
    });
    selectInfo.init = true; 
}
// Preset select2s for display
$(document).ready(function(){
    $(selects.supplierSelect.selector).select2({
        width: selects.supplierSelect.width
    })
    $(selects.accountSelect.selector).select2({
        width: selects.supplierSelect.width
    })
})
// General Init
$(document).ready(function(){
    setSelectList('supplierSelect')
    setSelectList('accountSelect')
})

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')
        suppliers = $(selects.supplierSelect.selector).val()
        accounts = $(selects.accountSelect.selector).val()
        startDate = $('#startDate').val()
        endDate = $('#endDate').val()
        openingEntry = $('#btncheck1').is(':checked')
        closingEntry = $('#btncheck2').is(':checked')
        isByAccount = getSelectedOption()

        formData = {
            'suppliers':suppliers,
            'accounts':accounts,
            'startDate':formatDate(startDate),
            'endDate':formatDate(endDate),
            'openingEntry':openingEntry,
            'closingEntry':closingEntry,
            'isByAccount':isByAccount,
        }
        jsonData = JSON.stringify(formData)

        $.ajax({
            url: accountanceSupplierExpenseUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                data = response.data

            tableData = data.map(function(key){ return key.cell })
            dataTableOptions.data = tableData
            $('#summaryTables').removeClass('d-none')

            $('#summaryDataTable').DataTable(dataTableOptions); 
            // // await initDataTable()
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

// Toggle display for additional options
$('#toggleOptions').on('click', function() {
    var $searchContent = $('#additionalOptions');
    var $arrowIcon = $('#toggleOptions i');

    if ($searchContent.hasClass('d-none')) {
        $searchContent.removeClass('d-none');
        $arrowIcon.removeClass('rotate');
    } else {
        $arrowIcon.addClass('rotate');
        $searchContent.addClass('d-none');
    }
});