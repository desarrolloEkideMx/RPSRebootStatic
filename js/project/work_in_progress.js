// Data table initialization
let data = '';
let dataTable;
let dataTableIsinitialized = false;
let tableHeight = "60vh";

// Save csrfToken to variable
var csrfToken = $('[name=csrfmiddlewaretoken]').val();

const dataTableOptions = {
    layout: {
        topStart: {
            buttons: [
                {extend:'colvis', text:'Ocultar/Mostrar', className: 'btn btn-dark btn-sm'},
                {extend:'pageLength',  text: "Filas", className: 'btn btn-dark btn-sm'},
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
        ]
        }
    },
    columnDefs:[
        {searchable:false, targets:[5,6,7,8,9,10,11]},
        {visible: false, targets:[0]}
    ],
    select: {
        style:'single'
    },
    paging: true,
    destroy: true,
    responsive:true,
    pageLength:10,    
    scrollCollapse: false,
    autoFill: false,
    scrollY: tableHeight,

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
    await listData(data)

    dataTable = $('#wipDataTable').DataTable(dataTableOptions)
    dataTableIsinitialized=true;
}

// Search submit
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTable').addClass('d-none')

        date = formatDate($('#date').val())     

        var formData = {
            'date' : date,
        }
        
        var jsonData = JSON.stringify(formData)
         // Gets summary list
         $.ajax({
            url: projectWIPUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: async function(response){
                console.log(response)
                data = response
                $('#summaryTable').removeClass('d-none')
                await initDataTable()
            },
            error: function(error){
                alert(error)
            }
        })

    })
})

async function listData(json){
    content = ``
    json.data.forEach((item)=>{
        content += `
            <tr>
                <td>${item['cell'][6]}</td>
                <td>${item['cell'][7]}</td>
                <td>${item['cell'][8]}</td>
                <td>${item['cell'][9]}</td>
                <td>${item['cell'][10]}</td>
                <td>$${formatNumber(item['cell'][11],2)}</td>
                <td>$${formatNumber(item['cell'][12],2)}</td>
                <td>$${formatNumber(item['cell'][13],2)}</td>
                <td>$${formatNumber(item['cell'][14],2)}</td>
                <td>$${formatNumber(item['cell'][15],2)}</td>
                <td>$${formatNumber(item['cell'][16],2)}</td>
                <td>$${formatNumber(item['cell'][17],2)}</td>
            </tr>
        `;
        });
    $('#wipTableBody').html(content);
}

// Toggle display for search section
document.getElementById('searchShowToggle').addEventListener('click', function() {
    var searchContent = document.getElementById('searchContent');
    var arrowIcon = document.querySelector('#searchShowToggle i');

    if (searchContent.classList.contains('d-none')) {
        searchContent.classList.remove('d-none');
        arrowIcon.classList.remove('rotate');
        dataTableOptions.scrollY = tableHeight
        initDataTable()
    } else {
        arrowIcon.classList.add('rotate');
        searchContent.classList.add('d-none');
        dataTableOptions.scrollY = "66vh"
        initDataTable()
    }
});