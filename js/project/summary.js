var csrfToken = $('[name=csrfmiddlewaretoken]').val();

// Search submit
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        $('#summaryTables').addClass('d-none')
        searchValue = $('#projectSelector').val()

        var formData = {
            'searchValue': searchValue,
            'lastProjectCreated': lastProjectCreated,
        }
        
        var jsonData = JSON.stringify(formData)

        // Gets project general list
        $.ajax({
            url: projectSummaryGeneralUrl,
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            success: function(response){
                console.log(response)
                listGeneral(response.data)
                $('#summaryTables').removeClass('d-none')
            },
            error: function(error){
                alert(error)
            }
        })
    })
})
// Init Select2
$(document).ready(function() {
    $('.js-example-basic-single').select2();
});

// Gets projects list
$(document).ready(function(){

    $.ajax({
        url: projectSummaryUrl,
        method: 'POST',
        headers: {'X-CSRFToken': csrfToken},

        success: function(response){
            console.log(response)
            listProjects(response.data)
            
            lastProjectCreated = response.data[0]
        },
        error: function(error){
            alert(error)
        }
    })
})

// List project general information
async function listGeneral(data){
    data.dates.forEach((item, index) => {
        const $row = $('#datesTableBody tr').eq(index);
        $row.find('td').remove();
        $row.append(`<td>${item}</td>`);
    });

    data.general_info.forEach((item, index) => {
        const $row = $('#generalTableBody tr').eq(index);
        $row.find('td').remove();
        $row.append(`<td>${item}</td>`);
    })

    let content = ``
    data.quotes[0].forEach((item) =>{
        content += `
            <tr>
                <td>${item.budget_project}</td>
                <td>${item.quote}</td>
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td>$ ${formatNumber(item.amount, 2)}</td>
                <td>$ ${formatNumber(item.amount_site_coin, 2)}</td>
            </tr>
        `;
        $('#quotesTableBody').html(content)
    })

    content = ``
    data.tasks.forEach((item)=>{
        content += `
            <tr>
                <td>${item.task_description}</td>
                <td>${formatNumber(item.estimated_hours, 1)}</td>
                <td>$ ${formatNumber(item.estimated_cost, 2)}</td>
                <td>${formatNumber(item.real_hours, 1)}</td>
                <td>$ ${formatNumber(item.real_cost, 2)}</td>
                <td>${formatNumber(item.delta_hours, 1)}</td>
                <td>$ ${formatNumber(item.delta_cost, 1)}</td>
                <td>${formatNumber(item.non_quality_hours, 1)}</td>
                <td>$ ${formatNumber(item.non_quality_cost, 2)}</td>
                <td>${formatNumber(item.total_hours, 1)}</td>
                <td>$ ${formatNumber(item.total_cost, 2)}</td>
            </tr>
        `;
        $('#tasksTableBody').html(content)
    })

    content = ``
    data.expenses.forEach((item) =>{
        if( item.budget === 0 && item.total_cost === 0) {
            return
        }

        content += `
            <tr>
                <td>${item.expense}</td>
                <td>$ ${formatNumber(item.budget, 2)}</td>
                <td>$ ${formatNumber(item.cost, 2)}</td>
                <td>$ ${formatNumber(item.delta_cost, 2)}</td>
                <td>$ ${formatNumber(item.non_quality_cost, 2)}</td>
                <td>$ ${formatNumber(item.total_cost, 2)}</td>
            </tr>
        `;
        $('#expensesTableBody').html(content)
    })

    
    var $row = $('#summaryTableBody tr').eq(0);
    $row.find('td').remove();
    let quotesTotal = data.quotes[1]
    $row.append(`<td>$ ${formatNumber(quotesTotal, 2)}</td>`);

    $row = $('#summaryTableBody tr').eq(1);
    $row.find('td').remove();
    let estimatedTotal = data.tasks[data.tasks.length - 1]['estimated_cost'] + data.expenses[data.expenses.length - 1]['budget']
    $row.append(`<td>$ ${formatNumber(estimatedTotal, 2)}</td>`);
    
    $row = $('#summaryTableBody tr').eq(2);
    $row.find('td').remove();
    let costTotal = data.tasks[data.tasks.length - 1]['real_cost'] + data.expenses[data.expenses.length - 1]['cost']
    $row.append(`<td>$ ${formatNumber(costTotal, 2)}</td>`);

    $row = $('#summaryTableBody tr').eq(3);
    let deltaCostTotal = data.tasks[data.tasks.length - 1]['delta_cost'] + data.expenses[data.expenses.length - 1]['delta_cost']
    $row.find('td').remove();
    $row.append(`<td>$ ${formatNumber(deltaCostTotal, 2)}</td>`);

    $row = $('#summaryTableBody tr').eq(4);
    let qualityTotal = data.tasks[data.tasks.length - 1]['non_quality_cost'] + data.expenses[data.expenses.length - 1]['non_quality_cost']
    $row.find('td').remove();
    $row.append(`<td>$ ${formatNumber(qualityTotal, 2)}</td>`);
  
    $row = $('#summaryTableBody tr').eq(5);
    let generalTotal = data.tasks[data.tasks.length - 1]['total_cost'] + data.expenses[data.expenses.length - 1]['total_cost']
    $row.find('td').remove();
    $row.append(`<td>$ ${formatNumber(generalTotal, 2)}</td>`);

    $row = $('#summaryTableBody tr').eq(6);
    let margin = (1-(generalTotal/quotesTotal))*100
    $row.find('td').remove();
    if(margin>0){
        cellColor = 'green';
    }else{
        cellColor = 'red'
    }
    $row.append(`<td style="color:${cellColor};">${formatNumber(margin, 2)}%</td>`);
}

// List projects
function listProjects(data){
    let content = `<option selected>Selecciona un proyecto Técnico</option>`;
    data.forEach((item) => {
        content += `
            <option value="${item[0]}">${item[0]} - ${item[1]}</option> 
        `;                    
        $('#projectSelector').html(content);
    })
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