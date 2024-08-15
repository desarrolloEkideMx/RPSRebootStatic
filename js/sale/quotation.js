var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Data table initialization
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "55vh";
let today

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
            {"title":"Cod. Cliente"}, //0
            {"title":"Cliente"}, //1
            {"title":"Cantidad"}, //2
            {"title":"Ofertado"}, //3
            {"title":"Cantidad"}, //4
            {"title":"Ofertado y aceptado este año"}, //5
            {"title":"Cantidad"}, //6
            {"title":"Total"}, //7
            {"title":"%"}, //8
        ],

    columnDefs:[
        {visible: false, targets:[0]},
        {
            "targets": [3,5,7],
            "render": function(data, type){
                if(data && data!=""){                    
                    return '$' + formatNumber(data, 2)
                }
                console.log(data)
                return '-'
            }
        },
        {
            "targets": [8],
            "render": function(data, type){
                if(data && data!=""){                    
                    return parseFloat(data).toFixed(2) + '%'
                }
                console.log(data)
                return '-'
            }
        },
    ],
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
    initComplete: function (){
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
    today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const year = today.getFullYear();
    todayFormattedDate = `${year}-${month}-${day}`;
    $('#dateInput').val(todayFormattedDate);
})

// Submit Action
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')
        date = $(dateInput).val()

        formData = {
            'date': formatDate(date),
        }

        jsonData = JSON.stringify(formData)
        
        $.ajax({
            url: saleQuotationUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                data = response.data
                tableData = data['rows'].map(function(key){
                    return key.cell
                })
                dataTableOptions.data = tableData
                $('#summaryTable').removeClass('d-none')

                total = data.userdata

                var content = `
                    <tr>
                        <th></th>
                        <th>Total:</th>
                        <th>${total.countAcep}</th>
                        <th>$${formatNumber(total.acep, 2)}</th>
                        <th>${total.countOfeAcep}</th>
                        <th>$${formatNumber(total.ofeAcep, 2)}</th>
                        <th>${total.countOfe}</th>
                        <th>$${formatNumber(total.ofe, 2)}</th>
                        <th>${total.valor} %</th>
                    </tr>
                `
                $('#summaryTableFooter').html(content)

                await initDataTable()
            },
            error: function(error){
                alert(error)
            },
        })
    })
})