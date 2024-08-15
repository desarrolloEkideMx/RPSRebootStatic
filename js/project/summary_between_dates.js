var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Search submit
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')

        startDate = formatDate($('#startDate').val())     
        endDate = formatDate($('#endDate').val())
        
        projectSpan = getSelectedOption()

        client = $('#clientSelector').val()
        employee = $('#employeeSelector').val()

        var formData = {
            'startDate' : startDate,
            'endDate' : endDate,
            'projectSpan' : projectSpan,
            'client' : client,
            'employee' : employee
        }

        var jsonData = JSON.stringify(formData)

         // Gets summary list
         $.ajax({
            url: projectSummaryBetweenDatesUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: function(response){
                console.log(response)
                $('#summaryTables').removeClass('d-none')
                listData(response)
            },
            error: function(error){
                alert(error)
            }
        })

    })
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

function listData(json){
    content = ``
    json.data.tasks.forEach((item)=>{
        if( item['cell'][2] === 0 && item['cell'][10] === 0) {
            return
        }
        content += `
            <tr>
                <td>${item['cell'][0]}</td>
                <td>${formatNumber(item['cell'][1], 1)}</td>
                <td>$ ${formatNumber(item['cell'][2], 2)}</td>
                <td>${formatNumber(item['cell'][3], 1)}</td>
                <td>$ ${formatNumber(item['cell'][4], 2)}</td>
                <td>${formatNumber(item['cell'][5], 1)}</td>
                <td>$ ${formatNumber(item['cell'][6], 1)}</td>
                <td>${formatNumber(item['cell'][7], 1)}</td>
                <td>$ ${formatNumber(item['cell'][8], 2)}</td>
                <td>${formatNumber(item['cell'][9], 1)}</td>
                <td>$ ${formatNumber(item['cell'][10], 2)}</td>
            </tr>
        `;
        $('#tasksTableBody').html(content)
    })

    content = ``
    json.data.outsourcing.forEach((item) =>{
        if( item['cell'][1] === 0 && item['cell'][5] === 0) {
            return
        }
        content += `
            <tr>
                <td>${item['cell'][0]}</td>
                <td>$ ${formatNumber(item['cell'][1], 2)}</td>
                <td>$ ${formatNumber(item['cell'][2], 2)}</td>
                <td>$ ${formatNumber(item['cell'][3], 2)}</td>
                <td>$ ${formatNumber(item['cell'][4], 2)}</td>
                <td>$ ${formatNumber(item['cell'][5], 2)}</td>
            </tr>
        `;
        $('#outsourcingTableBody').html(content)
    })

    content = ``
    json.data.materials.forEach((item) =>{
        if( item['cell'][1] === 0 && item['cell'][5] === 0) {
            return
        }
        content += `
            <tr>
                <td>${item['cell'][0]}</td>
                <td>$ ${formatNumber(item['cell'][1], 2)}</td>
                <td>$ ${formatNumber(item['cell'][2], 2)}</td>
                <td>$ ${formatNumber(item['cell'][3], 2)}</td>
                <td>$ ${formatNumber(item['cell'][4], 2)}</td>
                <td>$ ${formatNumber(item['cell'][5], 2)}</td>
            </tr>
        `;
        $('#materialsTableBody').html(content)
    })

    content = ``
    json.data.components.forEach((item) =>{
        if( item['cell'][1] === 0 && item['cell'][5] === 0) {
            return
        }
        content += `
            <tr>
                <td>${item['cell'][0]}</td>
                <td>$ ${formatNumber(item['cell'][1], 2)}</td>
                <td>$ ${formatNumber(item['cell'][2], 2)}</td>
                <td>$ ${formatNumber(item['cell'][3], 2)}</td>
                <td>$ ${formatNumber(item['cell'][4], 2)}</td>
                <td>$ ${formatNumber(item['cell'][5], 2)}</td>
            </tr>
        `;
        $('#componentsTableBody').html(content)
    })

    content = ``
    json.data.freights.forEach((item) =>{
        if( item['cell'][1] === 0 && item['cell'][5] === 0) {
            return
        }
        content += `
            <tr>
                <td>${item['cell'][0]}</td>
                <td>$ ${formatNumber(item['cell'][1], 2)}</td>
                <td>$ ${formatNumber(item['cell'][2], 2)}</td>
                <td>$ ${formatNumber(item['cell'][3], 2)}</td>
                <td>$ ${formatNumber(item['cell'][4], 2)}</td>
                <td>$ ${formatNumber(item['cell'][5], 2)}</td>
            </tr>
        `;
        $('#freightsTableBody').html(content)
    })
}

// Get selected option
function getSelectedOption(){
    const options = document.getElementsByName('options');
    for (const option of options){
        if(option.checked){
            return option.value;
        }
    }
}

// Format the specified date as dd/mm/yyyy
function formatDate(date){
    var parts = date.split('-');
    var formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

    return formattedDate
}

// Format numbers
function formatNumber(number, decimalPlaces = 0){
    if (number === 0) {
        return '-';
    }

    const factor = Math.pow(10, decimalPlaces);
    const roundedNumber = Math.round(number * factor)/factor;

    const numberString = roundedNumber.toFixed(decimalPlaces);

    const parts = numberString.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
}