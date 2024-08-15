function formatTime(value) {
    value = value.trim().toLowerCase();

    // Match different input formats
    const regexes = [
        { regex: /^(\d+):(\d{1,2})$/, format: (h, m) => `${pad(h)}:${pad(m)}` },
        { regex: /^(\d+)h\s*(\d+)?$/, format: (h, m = '00') => `${pad(h)}:${pad(m)}` },
        { regex: /^(\d+)min$/, format: (m) => `00:${pad(m)}` },
        { regex: /^(\d+)?h\s*(\d+)min$/, format: (h = '00', m) => `${pad(h)}:${pad(m)}` },
        { regex: /^(\d+)\s*hours?\s*(\d+)?\s*minutes?$/, format: (h, m = '00') => `${pad(h)}:${pad(m)}` },
        { regex: /^(\d+(\.\d+)?)$/, format: (h) => {
            const totalMinutes = Math.round(parseFloat(h) * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${pad(hours)}:${pad(minutes)}`;
        }},
        { regex: /^(\d+)\s*(\d{1,2})$/, format: (h, m) => `${pad(h)}:${pad(m)}` },
        { regex: /^(\d+),(\d{1,2})$/, format: (h, m) => `${pad(h)}:${pad(m)}` },
        { regex: /^:(\d{1,2})$/, format: (_, m) => `00:${pad(m)}` }
    ];

    for (const { regex, format } of regexes) {
        const match = value.match(regex);
        if (match) {
            return format(...match.slice(1));
        }
    }
    return null; // Return null if the format is not recognized
}

function pad(number) {
    return number.toString().padStart(2, '0');
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

// Format the specified date as dd/mm/yyyy
function formatDate(date){
    if(!date) return;
    var parts = date.split('-');
    var formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];
    return formattedDate
}

// Get selected option
function getSelectedOption(){
    const selectedOption = $('input[name="options"]:checked');
    if(selectedOption.length > 0) {
        return selectedOption.val();
    }
}

// Capitalize first letter
function capitalizeFirstLetter(str) {
    if (str.length === 0) return str;

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Split the time string into hours and minutes
function timeToHours(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const fractionalHours = minutes / 60;
    const totalHours = hours + fractionalHours;
    return totalHours.toFixed(2);
}