var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "55vh";

// Select Init
const selects = {
    clientSelect: { init: false, selector: '#clientSelect', width: '65%', url: saleGetClientListUrl},
    projectSelect: { init: false, selector: '#projectSelect', width: '70%', url: saleGetProjectListUrl},
    articleSelect: { init: false, selector: '#articleSelect', width: '70%', url: saleGetArticleListUrl},
};

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

    columns:[
        {title: 'Cod. Proyecto', data: 0}, //0
        {title: 'Desc. Proyecto', data: 1}, //1
        {title: 'País', data: 3}, //2
        {title: 'Cód. Cliente', data: 4}, //3
        {title: 'Cliente', data: 5}, //4
        {title: 'Cod. Artículo', data: 7 }, //5
        {title: 'Desc. Artículo', data: 9 }, //6
        {title: 'Pedido Cliente', data: 10 }, //7
        {title: 'Albarán', data: 11 }, //8
        {title: 'Factura', data: 12 }, //9
        {title: 'Fecha Factura', data: 13 }, //10
        {title: 'Tipo Factura', data:14 }, //11
        {title: 'Cant. Factura', data:15 }, //12
        {title: 'Precio u.Factura', data:16 }, //13
        {title: 'Desc. Factura', data:17 }, //14
        {title: 'Importe Factura', data:18 }, //15
        {title: 'Moneda Factura', data:19 }, //16
        {title: 'Cambio Factura', data:20 }, //17
        {title: 'Importe Factura MXP', data:21 }, //18
    ],

    columnDefs:[
        {visible: false, targets:[3,12,14]},
        {
            "targets": [13,15,17,18],
            "render": function(data, type){
                if(data && data!=""){                    
                    return '$' + parseFloat(data).toFixed(2)
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
    if (dataTableIsinitialized) dataTable.clear().destroy();

    dataTable = $('#summaryDataTable').DataTable(dataTableOptions)
    dataTableIsinitialized=true;
}

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')

        clients = $(selects.clientSelect.selector).val()
        projects = $(selects.projectSelect.selector).val()
        articles = $(selects.articleSelect.selector).val()
        startDate = $('#startDate').val()
        endDate = $('#endDate').val()

        formData = {
            'clients' : clients,
            'projects' : projects,
            'articles' : articles,
            'startDate' : formatDate(startDate),
            'endDate' : formatDate(endDate),
        }
        jsonData = JSON.stringify(formData)
        
        $.ajax({
            url: saleInvoiceDevelopmentUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                data = response.data
                tableData = data.map(function(key){
                    return key.cell
                })
                dataTableOptions.data = tableData

                $('#summaryTables').removeClass('d-none')
                await initDataTable()
            },
            error: function(error){
                alert(error)
            },
        })
    })
})

// Generic function to set search selects
function setSearchSelect(selectName) {
    const selectInfo = selects[selectName];
    if (selectInfo.init) $(selectInfo.selector).empty();

    $(selectInfo.selector).select2({       
        width: selectInfo.width,
        placeholder: "Selecciona una opción",
        minimumInputLength: 3,
        ajax: {
            delay: 250,
            url: selectInfo.url,
            data: function (params){
                var query = { searchStr: params.term }
                return query
            },
            processResults: function (data){
                reformatedData = data.data.map( element =>{
                    if(element.cmbCode !== element.cmbDesc){
                        return {
                            id: element.cmbCode,
                            text: element.cmbDesc + ' - ' + element.cmbCode
                        };
                    }else{
                        return {
                            id: element.cmbCode,
                            text: element.cmbCode
                        };
                    }
                })
                return {results: reformatedData};
            }
        }
    });
    selectInfo.init = true;
}
// Generic function to set a regular select
async function setSelectList(selectName){
    const selectInfo = selects[selectName];
    const data = await getList(selectInfo.url);
    console.log(data)
    var list
    if (selectName == 'clientSelect'){
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
    $(selects.clientSelect.selector).select2({
        width: selects.clientSelect.width
    })
    $(selects.projectSelect.selector).select2({
        width: selects.clientSelect.width
    })
})
// General Init
$(document).ready(function(){
    setSelectList('clientSelect')
    setSelectList('projectSelect')
    setSearchSelect('articleSelect')
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