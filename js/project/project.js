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

// Format the specified date as dd/mm/yyyy
function formatDate(date){
    var parts = date.split('-');
    var formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

    return formattedDate
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