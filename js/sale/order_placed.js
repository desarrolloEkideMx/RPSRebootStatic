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
        {title: "Cod. Proyecto", data: 0}, //0
        {title: "Proyecto", data: 1}, //1
        {title: "País", data: 3}, //2
        {title: "Cod. Cliente", data: 4}, //3
        {title: "Cliente", data: 5}, //4
        {title: "Pedido", data: 9}, //5
        {title: "Pedido Cliente", data: 11}, //6
        {title: "Dirección", data: 12}, //7
        {title: "Fecha Pedido", data: 13}, //8
        {title: "Tipo Albarán", data: 16}, //9
        {title: "Desc. Artículo", data: 19}, //10
        {title: "Cant. Pedido", data: 20}, //11
        {title: "Precio u.Pedido", data: 21}, //12
        {title: "Desc. Pedido", data: 22}, //13
        {title: "Importe Pedido", data: 23}, //14
        {title: "Moneda Pedido", data: 24}, //15
        {title: "Cambio Pedido", data: 25}, //16
        {title: "Importe Pedido MXP", data: 26}, //17
        {title: "Fecha Entrega", data: 27}, //18
        {title: "Fecha Sol.", data: 28}, //19
        {title: "Entregado", data: 29}, //20
        {title: "Cant. Enviada", data: 30}, //21
        {title: "Cant. Facturada", data: 31}, //22
        {title: "Albarán", data: 32}, //23
        {title: "Fecha Albarán", data: 33}, //24
        {title: "Tipo Albarán", data: 34}, //25
        {title: "Cant. Albarán", data: 35}, //26
        {title: "Precio u.Albarán", data: 36}, //27
        {title: "Desc. Albarán", data: 37}, //28
        {title: "Importe Albarán", data: 38}, //29
        {title: "Moneda Albarán", data: 39}, //30
        {title: "Cambio Albarán", data: 40}, //31
        {title: "Importe Albarán MXP", data: 41}, //32
        {title: "Facturado", data: 42}, //33
        {title: "Cant. Facturada", data: 43}, //34
        {title: "Albarán", data: 44}, //35
        {title: "Fecha Albarán", data: 45}, //36
        {title: "Tipo Albarán", data: 46}, //37
        {title: "Cant. Albarán", data: 47}, //38
        {title: "Precio u.Albarán", data: 48}, //39
        {title: "Desc. Albarán", data: 49}, //40
        {title: "Importe Albarán", data: 50}, //41
        {title: "Moneda Albarán", data: 51}, //42
        {title: "Cambio Albarán", data: 52}, //43
        {title: "Importe Albarán MXP", data: 53}, //44
    ],

    columnDefs:[
        {visible: false, targets:[]},
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
            url: saleOrderPlacedUrl,
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