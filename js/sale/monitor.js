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
    orderSelect: { init: false, selector: '#orderSelect', width: '70%', url: saleGetOrderListUrl},
    clientOrderSelect: { init: false, selector: '#clientOrderSelect', width: '65%', url: saleGetClientOrderListUrl},
    noteSelect: { init: false, selector: '#noteSelect', width: '70%', url: saleGetNoteListUrl},
    invoiceSelect: { init: false, selector: '#invoiceSelect', width: '70%', url: saleGetInvoiceListUrl}
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
        {title: 'Cod. Proyecto', data: 0 }, //0
        {title: 'Desc. Proyecto', data: 1 }, //1
        {title: 'País', data: 3 }, //2
        {title: 'Cód. Cliente', data: 4 }, //3
        {title: 'Cliente', data: 5 }, //4
        {title: 'Cod.Pedido', data: 7 }, //5
        {title: 'Pedido', data: 9 }, //6
        {title: 'P. Cliente', data: 11 }, //7
        {title: 'Dirección', data: 12 }, //8
        {title: 'Fecha Pedido', data: 13 }, //9
        {title: 'Tipo Albarán', data: 16 }, //10
        {title: 'Cod. Artículo', data: 17 }, //11
        {title: 'Desc. Artículo', data: 19 }, //12
        {title: 'Cant. Pedido', data: 20 }, //13
        {title: 'Precio u.Pedido', data: 21 }, //14
        {title: 'Desc. Pedido', data: 22 }, //15
        {title: 'Importe Pedido', data: 23 }, //16
        {title: 'Moneda Pedido', data: 24 }, //17
        {title: 'Cambio Pedido', data: 25 }, //18
        {title: 'Importe Pedido MXP', data: 26 }, //19
        {title: 'Fecha Entrega', data: 27 }, //20
        {title: 'Fecha Entrega Sol.', data: 28 }, //21
        {title: 'Entregado', data: 29 }, //22
        {title: 'Cant. Enviada', data: 30 }, //23
        {title: 'Cant. Facturada', data: 31 }, //24
        {title: 'Albarán', data: 32 }, //25
        {title: 'Fecha Albarán', data: 33 }, //26
        {title: 'Tipo Albarán', data: 34 }, //27
        {title: 'Cant. Albarán', data: 35 }, //28
        {title: 'Precio u.Albarán', data: 36 }, //29
        {title: 'Desc. Albarán', data: 37 }, //30
        {title: 'Importe Albarán', data: 38 }, //31
        {title: 'Moneda Albarán', data: 39 }, //32
        {title: 'Cambio Albarán', data: 40 }, //33
        {title: 'Importe Albarán MXP', data: 41 }, //34
        {title: 'Facturado', data: 42 }, //35
        {title: 'Cant. Alb.Factura', data: 43 }, //36
        {title: 'Factura', data: 44 }, //37
        {title: 'Fecha Factura', data: 45 }, //38
        {title: 'Tipo Alb. Facturado', data: 46 }, //39
        {title: 'Cant. Factura', data: 47 }, //40
        {title: 'Precio u.Factura', data: 48 }, //41
        {title: 'Desc. Factura', data: 49 }, //42
        {title: 'Importe Factura', data: 50 }, //43
        {title: 'Moneda Factura', data: 51 }, //44
        {title: 'Cambio Factura', data: 52 }, //45
        {title: 'Importe Factura MXP', data: 53 }, //46
    ],

    columnDefs:[
        {visible: false, targets:[3,5,11,15,37]},
        {
            "targets": [14,16,18,19,29,31,33,34,41,43,45,46],
            "render": function(data, type){
                if(data && data!=""){
                    
                    return '$' + parseFloat(data).toFixed(2)
                }
                return '-'
            }
        },
        {
            "targets": [22,35],
            "render": function(data, type){
                if(!data){
                    return "<div style='text-align:center;'><i class='bx bxs-check-circle' style='color: green;'></i></div>";
                }
                return "<div style='text-align:center;'><i class='bx bxs-x-circle' style='color: red;'></i></div>";
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
        orders = $(selects.orderSelect.selector).val()
        clientOrders = $(selects.clientOrderSelect.selector).val()
        notes = $(selects.noteSelect.selector).val()
        invoices = $(selects.invoiceSelect.selector).val()
        startDate = $('#startDate').val()
        endDate = $('#endDate').val()

        formData = {
            'clients' : clients,
            'projects' : projects,
            'articles' : articles,
            'orders' : orders,
            'clientOrders' : clientOrders,
            'notes' : notes,
            'invoices' : invoices,
            'startDate' : formatDate(startDate),
            'endDate' : formatDate(endDate),
        }
        console.log(formData)
        jsonData = JSON.stringify(formData)
        
        $.ajax({
            url: saleMonitorUrl,
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
    setSearchSelect('orderSelect')
    setSearchSelect('clientOrderSelect')
    setSearchSelect('noteSelect')
    setSearchSelect('invoiceSelect')
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