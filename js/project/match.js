// Search submit
$(document).ready(function(){
    $('#btnSearch').on('click', function(){
        
        searchValue = $('#searchInput').val()
        selectedOption = getSelectedOption()
        var csrfToken = $('[name=csrfmiddlewaretoken]').val();
        var formData = {
            'searchValue': searchValue,
            'selectedOption': selectedOption,
        }
        var jsonData = JSON.stringify(formData)
        $.ajax({
            url: projectMatchUrl,
            method: 'POST',
            contentType: 'application/json',
            headers: {'X-CSRFToken': csrfToken},
            data: jsonData,
            
            success: function(response) {
                $('#matchTables').removeClass('d-none')
                console.log(response);
                quotesData = response.rowsOferta;
                budgetProjectsData = response.rowsProyPRE;
                technicalProjectsData = response.rowsProyTEC;
                internalOrderData = response.rowsPedido;
                externalOrderData = response.rowsAlbaran;
                invoicesData = response.rowsFactura;

                fillGeneralData(quotesData);
                fillQuotesData(quotesData);
                fillBudgetProjectsData(budgetProjectsData);
                
                fillTechnicalProjectsData(technicalProjectsData);
                fillInternalOrdersData(internalOrderData);
                fillExternalOrdersData(externalOrderData);
                fillInvoicesData(invoicesData);

            }
        });
    })
})

// Enter to search
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        btnSearch.click();   // Programmatically click the search button
    }
});

function fillGeneralData(data){
    let content = ``;
    item = data[0];

    content = `
            <tr>
                <td>${item.cell[5]}</td>
                <td>${item.cell[6]}</td>
                <td>${item.cell[16]}</td>
                <td>${item.cell[17]}</td>
            </tr>
        `;

    $('#tableBodyGeneral').html(content);
}

function fillQuotesData(data){
    let content = ``;
    data.forEach((quote, index) => {
        content += `
            <tr>
                <td>${quote.cell[0]}</td> 
                <td>${quote.cell[1]}</td>
                <td>${quote.cell[2]}</td>
                <td>${quote.cell[4]}</td>
                <td>${quote.cell[7]}</td>
                <td>${quote.cell[8]}</td>
                <td>${quote.cell[9]}</td>
                <td>${quote.cell[10]}</td>
                <td>${quote.cell[11]}</td>
                <td>${quote.cell[13]}</td>
                <td>${quote.cell[14]}</td>
                <td>${quote.cell[15]}</td>
            </tr>
        `;                    
        $('#tableBodyQuotes').html(content);
    })
}

function fillBudgetProjectsData(data){
    let content = ``;
    data.forEach((item, index) => {
        content += `
            <tr>
                <td>${item.cell[0]}</td>
                <td>${item.cell[1]}</td>
                <td>${item.cell[2]}</td>
                <td>${item.cell[3]}</td>
                <td>${item.cell[4]}</td>
                <td>${item.cell[5]}</td>
                <td>${item.cell[6]}</td>
                <td>${item.cell[7]}</td>
                <td>${item.cell[9]}</td>
                <td>${item.cell[11]}</td>
                <td>${item.cell[12]}</td>
                <td>${item.cell[13]}</td>
            </tr>
        `;                    
        $('#tableBodyBudgetProjects').html(content);
    })
}

function fillTechnicalProjectsData(data){
    let content = ``;
    data.forEach((item, index) => {
        content += `
            <tr>
                <td>${item.cell[0]}</td>
                <td>${item.cell[1]}</td>
                <td>${item.cell[2]}</td>
                <td>${item.cell[4]}</td>
                <td>${item.cell[5]}</td>
                <td>${item.cell[6]}</td>
                <td>${item.cell[7]}</td>
                <td>${item.cell[9]}</td>
                <td>${item.cell[11]}</td>
                <td>${item.cell[12]}</td>
                <td>${item.cell[13]}</td>
            </tr>
        `;                    
        $('#tableBodyTechnicalProjects').html(content);
    })
}

function fillInternalOrdersData(data){
    let content = ``;
    data.forEach((item, index) => {
        content += `
            <tr>
                <td>${item.cell[0]}</td>
                <td>${item.cell[1]}</td>
                <td>${item.cell[2]}</td>
                <td>${item.cell[3]}</td>
                <td>${item.cell[4]}</td>
                <td>${item.cell[5]}</td>
                <td>${item.cell[8]}</td>
                <td>${item.cell[9]}</td>
                <td>${item.cell[10]}</td>
                <td>${item.cell[11]}</td>
                <td>${item.cell[13]}</td>
                <td>${item.cell[14]}</td>
                <td>${item.cell[15]}</td>
                <td>${item.cell[16]}</td>
                <td>${item.cell[17]}</td>
                <td>${item.cell[19]}</td>
                <td>${item.cell[20]}</td>
                <td>${item.cell[21]}</td>
                <td>${item.cell[22]}</td>
                <td>${item.cell[23]}</td>
            </tr>
        `;                    
        $('#tableBodyInternalOrders').html(content);
    })
}

function fillExternalOrdersData(data){
    let content = ``;
    data.forEach((item, index) => {
        content += `
            <tr>
                <td>${item.cell[0]}</td>
                <td>${item.cell[1]}</td>
                <td>${item.cell[2]}</td>
                <td>${item.cell[3]}</td>
                <td>${item.cell[4]}</td>
                <td>${item.cell[7]}</td>
                <td>${item.cell[8]}</td>
                <td>${item.cell[9]}</td>
                <td>${item.cell[10]}</td>
                <td>${item.cell[12]}</td>
                <td>${item.cell[13]}</td>
                <td>${item.cell[14]}</td>
            </tr>
        `;                    
        $('#tableBodyExternalOrders').html(content);
    })
}

function fillInvoicesData(data){
    let content = ``;
    data.forEach((item, index) => {
        content += `
            <tr>
                <td>${item.cell[0]}</td>
                <td>${item.cell[1]}</td>
                <td>${item.cell[2]}</td>
                <td>${item.cell[3]}</td>
                <td>${item.cell[4]}</td>
                <td>${item.cell[7]}</td>
                <td>${item.cell[8]}</td>
                <td>${item.cell[9]}</td>
                <td>${item.cell[10]}</td>
                <td>${item.cell[11]}</td>
                <td>${item.cell[12]}</td>
                <td>${item.cell[13]}</td>
            </tr>
        `;                    
        $('#tableBodyInvoices').html(content);
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