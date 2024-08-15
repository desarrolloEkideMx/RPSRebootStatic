var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "55vh";

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
            {"title":"Cod. Proyecto"}, // 0
            {"title":"Proyecto"}, // 1
            {"title":"Cod. Proveedor"}, // 2
            {"title":"Proveedor"}, // 3
            {"title":"Pedido"}, // 4
            {"title":"Fecha Solicitud"}, // 5
            {"title":"Cod. Usuario"}, // 6
            {"title":"Usuario"}, // 7
            {"title":"#"}, // 8
            {"title":"Línea"}, // 9
            {"title":"Tipo Albarán Pedido"}, // 10
            {"title":"OF"}, // 11
            {"title":"Cuenta Contable"}, // 12
            {"title":"Cod. Artículo"}, // 13
            {"title":"Artículo"}, // 14
            {"title":"Descripción"}, // 15
            {"title":"Artículo Padre"}, // 16
            {"title":"Cant. Pedido"}, // 17
            {"title":"Precio Unitario"}, // 18
            {"title":"Descuento Pedido"}, // 19
            {"title":"Importe Pedido"}, // 20
            {"title":"Moneda Pedido"}, // 21
            {"title":"Cambio Pedido"}, // 22
            {"title":"Importe Pedido MXN"}, // 23
            {"title":"Fecha Entrega"}, // 24
            {"title":"Fecha Requerida"}, // 25
            {"title":"Recibido"}, // 26
            {"title":"Cant. Recibida"}, // 27
            {"title":"Cant. Facturada"}, // 28
            {"title":"Albarán"}, // 29
            {"title":"Fecha Albarán"}, // 30
            {"title":"Tipo Albarán"}, // 31
            {"title":"Cambio Albarán"}, // 32
            {"title":"Importe Albarán"}, // 33
            {"title":"Descuento Albarán"}, // 34
            {"title":"Importe Albarán MXP"}, // 35
            {"title":"Moneda Factura"}, // 36
            {"title":"Cambio Factura"}, // 37
            {"title":"Importe Factura"}, // 38
            {"title":"Facturado"}, // 39
            {"title":"Factura"}, // 40
            {"title":"Fecha Factura"}, // 41
            {"title":"Cant. Albarán Facturada"}, // 42
            {"title":"Cant. Pendiente Factura"}, // 43
            {"title":"Importe Pendiente Factura"} // 44
        ],

    columnDefs:[
        {visible: false, targets:[2,6,8,9,11,12,13,16]},
        {
            "targets": [18,20,23,33,35,38,44],
            "render": function(data, type){
                if(data){
                    return '$' + parseFloat(data).toFixed(2)
                }
                return data
            }
        },
        {
            "targets": [26,39],
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

// Select Init
const selects = {
    supplierSelect: { init: false, selector: '#supplierSelect', width: '65%', url: purchaseGetSupplierListUrl},
    projectSelect: { init: false, selector: '#projectSelect', width: '70%', url: purchaseGetProjectListUrl},
    articleSelect: { init: false, selector: '#articleSelect', width: '70%', url: purchaseGetArticleListUrl},
    noteSelect: { init: false, selector: '#noteSelect', width: '70%', url: purchaseGetNoteListUrl},
};

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')

        suppliers = $(selects.supplierSelect.selector).val()
        projects = $(selects.projectSelect.selector).val()
        articles = $(selects.articleSelect.selector).val()
        notes = $(selects.noteSelect.selector).val()
        startDate = $('#startDate').val()
        endDate = $('#endDate').val()

        formData = {
            'suppliers' : suppliers,
            'projects' : projects,
            'articles' : articles,
            'notes' : notes,
            'startDate' : formatDate(startDate),
            'endDate' : formatDate(endDate),
        }

        console.log(formData)
        jsonData = JSON.stringify(formData)

        console.log(startDate)
        console.log(formatDate(startDate))
        
        $.ajax({
            url: purchaseUninvoicedNotesUrl,
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
    $(selects.projectSelect.selector).select2({
        width: selects.supplierSelect.width
    })
})
// General Init
$(document).ready(function(){
    setSelectList('supplierSelect')
    setSelectList('projectSelect')
    setSearchSelect('articleSelect')
    setSearchSelect('noteSelect')
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