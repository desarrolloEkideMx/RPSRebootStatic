var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Select Init
let clientSelect;
let clientSelectInit = false;

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "59vh";

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
            {"title":"Cod. Negocio", data: 1}, //0
            {"title":"Negocio", data: 2}, //1
            {"title":"Cod. Cliente", data: 5}, //2
            {"title":"Cliente", data: 6}, //3
            {"title":"Cod. Proyecto", data: 7}, //4
            {"title":"Desc. Proyecto", data: 8}, //5
            {"title":"Responsable", data: 10}, //6
            {"title":"Fecha", data: 11}, //7
            {"title":"Ofertado", data: 12}, //8
            {"title":"Pedido", data: 13}, //9
            {"title":"Facturado", data: 14}, //10
        ],

    columnDefs:[
        {visible: false, targets:[0,2]},
        {
            "targets": [8,9,10],
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
    paging: true,
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


/* Init General */
$(document).ready(async function(){
    clientsJson = JSON.parse(clients.replace(/'/g, '"'))

    const list = clientsJson.map(element => ({
        id: element.cmbCode,
        text: `${element.cmbDesc} - ${element.cmbCode}`
    }))

    setClientSelect(list);
})

// Sets the client select options to list object
function setClientSelect(list){
    if (clientSelectInit) clientSelect.empty();    
    clientSelect = $('#clientSelect').select2({
        width:'75%',
        placeholder:"Selecciona una opción",
        data: list,
    })
    clientSelectInit = true;
}

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')

        clientList = $(clientSelect).val()        
        isUserProject = $('#btnIsUserProject').is(':checked')

        formData = {
            'clientList': clientList,
            'isUserProject': isUserProject,
        }

        jsonData = JSON.stringify(formData)
        
        $.ajax({
            url: salePendingInvoiceUrl,
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