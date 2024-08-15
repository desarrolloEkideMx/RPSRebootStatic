var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "55vh";

// Select Init
const selects = {
    supplierSelect: { init: false, selector: '#supplierSelect', width: '65%', url: purchaseGetSupplierListUrl},
    projectSelect: { init: false, selector: '#projectSelect', width: '70%', url: purchaseGetProjectListUrl},
    articleSelect: { init: false, selector: '#articleSelect', width: '70%', url: purchaseGetArticleListUrl},
    orderSelect: { init: false, selector: '#orderSelect', width: '70%', url: purchaseGetOrderListUrl},
    employeeSelect: { init: false, selector: '#employeeSelect', width: '70%', url: purchaseGetEmployeeListUrl},
    invoiceSelect: { init: false, selector: '#invoiceSelect', width: '70%', url: purchaseGetInvoiceListUrl}
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

    "columns":[
            {"title":"Cod. Proyecto"},
            {"title":"Proyecto"},
            {"title":"Cod. Proveedor"},
            {"title":"Proveedor"},
            {"title":"Pedido"},
            {"title":"Fecha Solicitud"},
            {"title":"Cod. Usuario"},
            {"title":"Usuario"},
            {"title":"#"},
            {"title":"Línea"},
            {"title":"Tipo Albarán Pedido"},
            {"title":"OF"},
            {"title":"Cuenta Contable"},
            {"title":"Cod. Artículo"},
            {"title":"Artículo"},
            {"title":"Descripción"},
            {"title":"Artículo Padre"},
            {"title":"Cant. Pedido"},
            {"title":"Precio Unitario"},
            {"title":"Descuento Pedido"},
            {"title":"Importe Pedido"},
            {"title":"Moneda Pedido"},
            {"title":"Cambio Pedido"},
            {"title":"Importe Pedido MXN"},
            {"title":"Fecha Entrega"},
            {"title":"Fecha Requerida"}
        ],

    columnDefs:[
        {visible: false, targets:[2,6,8,9,11,12,13,16]},
        {
            "targets": [18,20,23,27],
            "render": function(data, type){
                if(data){
                    return '$' + parseFloat(data).toFixed(2)
                }
                return data
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

        suppliers = $(selects.supplierSelect.selector).val()
        projects = $(selects.projectSelect.selector).val()
        articles = $(selects.articleSelect.selector).val()
        orders = $(selects.orderSelect.selector).val()
        employees = $(selects.employeeSelect.selector).val()
        orderType = getSelectedOption()

        formData = {
            'suppliers' : suppliers,
            'projects' : projects,
            'articles' : articles,
            'orders' : orders,
            'employees' : employees,
            'orderType' : orderType,
        }
        console.log(formData)
        jsonData = JSON.stringify(formData)
        
        if(orderType == '0'){
            dataTableOptions.columns.push(...[
                {"title":"Cant. por recibir"},
                {"title":"Importe por recibir"}
            ])
        }else{
            dataTableOptions.columns.push(...[
                {"title":"Cant. por facturar"},
                {"title":"Importe por facturar"}
            ])
        }

        $.ajax({
            url: purchaseMonitorOrderUrl,
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
                dataTableOptions.columns = dataTableOptions.columns.slice(0, -2)
            },
            error: function(error){
                alert(error)
            },
        })
    })
})

// Generic function to set search select2
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
            data: function (params) {
                var query = { searchStr: params.term }
                return query
            },
            processResults: function (data) {
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
// Generic function to set a regular select2
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
// Generic function to set regular select2
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
    $(selects.projectSelect.selector).select2({
        width: selects.supplierSelect.width
    })
})
// General Init
$(document).ready(function(){
    setSelectList('supplierSelect')
    setSelectList('projectSelect')
    setSearchSelect('articleSelect')
    setSearchSelect('orderSelect')
    setSelectList('employeeSelect')
})

// Get selected option
function getSelectedOption(){
    return $('input[name="options"]:checked').val();
}

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