/* General variables */
let deleteData //Saves selected row data on delete
let firstProjectId //Saves the first project to trigger change tasks on change
const indirectProjectId = '0fda31e8-83cf-4231-99b2-0ec36516740d' //Indirect project ID
var csrfToken = $('[name=csrfmiddlewaretoken]').val(); //CSRF for post calls
let todayFormattedDate

/* Init variables */
// Select Init
let businessSelect;
let businessSelectInit = false;
let machineSelect;
let machineSelectInit = false;
let projectSelect;
let projectSelectInit = false;
let taskSelect;
let taskSelectInit = false;
let causeSelect;
let causeSelectInit = false;
let commentSelect;
let commentSelectInit = false;
// Data table init
let employeeDataTable;
let employeeDataTableIsinit = false;
let machineDataTable;
let machineDataTableIsinit = false;

/* Booleans */
let businessChange = true;
let projectChange = true;
let editInProgress = false;

/* Data Tables Options */
var dataTableOptions = {
    columns: [
        {title: 'Fecha', data:'fechaBono'},
        {title: 'Máquina', data:'desMaquina'},
        {title: 'Código', data:'codProyecto'},
        {title: 'Proyecto', data:'desProyecto'},
        {title: 'Tarea', data:'desTarea'},
        {title: 'Causa', data:'desImprod'},
        {title: 'Tiempo', data:'tiempo'},
        {title: 'Tipo', data:'desTipoHora'},
        {title: 'Comentario', data:'coment'},
        {
            title: 'Accion', data: null, 
            defaultContent: `
            <div class="d-flex">
                <button class="btn btn-sm btn-dark btn-edit" type="button" data-bs-toggle="modal" data-bs-target="#timeAllocationModal">
                    <i class="bx bxs-edit"></i>
                </button>
                <button class="btn btn-sm btn-secondary btn-delete ms-1" type="button" data-bs-toggle="modal" data-bs-target="#deleteAllocationModal">
                    <i class='bx bx-trash-alt' ></i>
                </button>
            </div>`
        },
    ],
    columnDefs:[
        {orderable: false, targets:[9]},
        {
            "targets": 6,
            "render": function(data, type){
                if(type === 'display'){
                    return data.replace(',','.');
                }
                return data;
            }
        },
    ],
    select: {
        style:'api'
    },
    paging: false,
    searching: false,
    destroy: true,
    responsive: true,
    pageLength:10,    
    scrollCollapse: false,
    autoFill: false,
    order: [],
    footerCallback: function (row, data, start, end, display){
            var api = this.api();
            // Helper function to parse the data in '1.0' format
            var floatVal = function (i){
                return typeof i === 'string' ?
                parseFloat(i.replace(',','.')) :
                typeof i === 'number' ?
                i : 0;
            };
            
            // Total over all pages
            var total = api
            .column(6)
            .data()
            .reduce(function (a, b){
                    return floatVal(a) + floatVal(b);
                }, 0);           
            
            total = parseFloat(total).toFixed(2)

            // Update footer
            $(api.column(6).footer()).html(`${total} h`);
        }
}

/* Init General */
$(document).ready(async function(){
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const year = today.getFullYear();
    todayFormattedDate = `${year}-${month}-${day}`;

    userDataJson = JSON.parse(userData.replace(/'/g, '"'))    
    userDataJson.site.includes('SERIES CORTAS') ? $('#resourceRadio').addClass('d-none') : null

    $('#dateInput').val(todayFormattedDate);
    $('#dateInputModal').val(todayFormattedDate);

    getTimeAllocations(formatDate(todayFormattedDate))
    getMachineTimeAllocations(formatDate(todayFormattedDate))

    await setBusinessList()
    setMachineList()
    setCauseList()
    setCommentSelect()
})

/* DataTables */
// Employee Allocations DataTables
const employeeInitDataTable = async()=>{
    if (employeeDataTableIsinit){
        employeeDataTable.clear().destroy();
    }
    dataTableOptions.columns[1].data = 'desMaquina'
    employeeDataTable = $('#employeeDataTable').DataTable(dataTableOptions)
    employeeDataTableIsinit=true;
}
// Get Employee List
async function getTimeAllocations(date){
    $.ajax({
        url: timeGetAllocationListUrl,
        method: 'GET',
        data: {
            date: date
        },
        headers: {'X-CSRFToken': csrfToken},
        success: async function(response){
            data = response.data

            rowData = data.rows
            dataTableOptions.data = rowData

            $('#summaryTables').removeClass('d-none')
            await employeeInitDataTable()
        },
        error: function(error){
            alert(error);
        }
    })
}
// Machine Allocations DataTables
const machineInitDataTable = async()=>{
    if (machineDataTableIsinit){
        machineDataTable.clear().destroy();
    }
    dataTableOptions.columns[1].data = 'desRecurso'
    machineDataTable = $('#machineDataTable').DataTable(dataTableOptions)
    machineDataTableIsinit=true;
}
// Get Machine List
async function getMachineTimeAllocations(date){
    $.ajax({
        url: timeGetMachineAllocationListUrl,
        method: 'GET',
        data: {
            date: date
        },
        headers: {'X-CSRFToken': csrfToken},
        success: async function(response){
            data = response.data

            totalTime = data.userdata.tiempo.replace(',','.')
            if (totalTime>0){
                rowData = data.rows
                dataTableOptions.data = rowData
                $('#machineTables').removeClass('d-none')
                await machineInitDataTable()
            }else{
                $('#machineTables').addClass('d-none')
            }

        },
        error: function(error){
            alert(error);
        }
    })
}

/* Business select */
// Sets business list
async function setBusinessList(){
    var data = await getBusinessList();
    let list = data.data.map(element => {
        return { id: element.cmbId, text: element.cmbCompleto};
        });
    list.unshift({id:"", text: "Selecciona un negocio"});    
    setBusinessSelect(list);
}
// Gets business list
async function getBusinessList(){
    let response = $.ajax({
        url: timeGetBusinessListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}
// Sets the business select options to list object
function setBusinessSelect(list){
    if (businessSelectInit) businessSelect.empty();

    businessSelect = $('#businessSelect').select2({
        width:'70%',
        placeholder:"Selecciona un negocio",
        data:list,
        dropdownParent: $('#timeAllocationModal')
    })

    businessSelect.find('option').each(async function(){
        if ($(this).text().includes(userDataJson.site)){
            if (businessSelect.val() !== $(this).val()){
                businessSelect.val($(this).val()).trigger('change');
            }
        }        
    });
}

/* Machine Select */
// Sets machine list
async function setMachineList(){
    var data = await getMachineList();
    let list = data.data.map(element => {
        return { id: element.cmbId, text: element.cmbCompleto};
        });
    setMachineSelect(list);
}
// Gets machine list
async function getMachineList(){
    var businessUnitId = businessSelect.val();
    let response = $.ajax({
        url: timeGetMachineListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        data:{
            businessUnitId:businessUnitId            
        },
        success: function(response){
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}
// Sets the machine select options to list object
function setMachineSelect(list){
    if (machineSelectInit) machineSelect.empty();
    
    machineSelect = $('#machineSelect').select2({
        width:'69%',
        placeholder:"Selecciona una máquina",
        data:list,
        dropdownParent: $('#timeAllocationModal')
    })
    machineSelectInit = true;
}

/* Project Select */
// Sets project list
async function setProjectList(){
    var businessUnitId = businessSelect.val();
    var data = await getProjectList(businessUnitId);
    let list = data.data.map(element => {
        if (element.cmbId == 'f2a6a4b7-8f73-4efb-9b46-8213b2541972'){
            return null;
        }else if(element.cmbId == indirectProjectId){
            return { id: element.cmbId, text: "Indirecto - Proyecto Indirectos UC"};
        }
        else{
            return { id: element.cmbId, text: `${element.cmbCode} - ${element.cmbDesc}`};
        }
        }).filter(function(column){
            return column !== null;
        });;
    setProjectSelect(list);
}
// Gets project list
async function getProjectList(businessUnitId){
    let response = $.ajax({
        url: timeGetProjectOngoingListUrl,
        method: 'GET',
        data: {businessUnitId:businessUnitId},
        headers: {'X-CSRFToken':csrfToken},
        success: function(response){
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}
// Sets the project select options to list object
function setProjectSelect(list){
    if (projectSelectInit) projectSelect.empty();
    
    projectSelect = $('#projectSelect').select2({
        width:'75%',
        placeholder:"Selecciona uno o más proyectos",
        data:list,
        dropdownParent: $('#timeAllocationModal')
    })
    projectSelectInit = true;
}

/* Task Select */
// Sets task list
async function setTaskList(){
    var data = await getTaskList(firstProjectId);
    let list = data.data.map(element => {
        return { id: element.cmbCode, text: element.cmbDesc};
        });    
    firstProjectId == indirectProjectId ? null : list.unshift({id:"", text: "Selecciona una tarea"});
    setTaskSelect(list);
}
// Gets task list
async function getTaskList(projectId){
    var selectedBusinessText = businessSelect.find('option:selected').text()
    var belongsToBusiness = selectedBusinessText.includes(userDataJson.site)
    var isMachine = getSelectedOption()

    let response = $.ajax({
        url: timeGetTaskListUrl,
        method: 'GET',
        data:{
            projectId: projectId,
            belongsToBusiness: belongsToBusiness,
            isMachine: isMachine,
        },
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}
// Sets the task select options to list object
function setTaskSelect(list){
    if (taskSelectInit) taskSelect.empty();
    
    taskSelect = $('#taskSelect').select2({
        width:'64.3%',
        placeholder:"Selecciona una tarea",
        data:list,
        dropdownParent: $('#timeAllocationModal')
    })
    taskSelectInit = true;
}

/* Cause Select */
// Sets cause list
async function setCauseList(){
    var data = await getCauseList();
    let list = data.data.map(element => {
        return { id: element.cmbCode, text: capitalizeFirstLetter(element.cmbDesc)};
        });    
    list.unshift({id:"", text: "Selecciona una causa"});
    setCauseSelect(list);
}
// Gets cause list
async function getCauseList(){
    let response = $.ajax({
        url: timeGetCauseListUrl,
        method: 'GET',
        headers: {'X-CSRFToken': csrfToken},
        success: function(response){
            return response
        },
        error: function(error){
            alert(error);
        }
    })
    return response
}
// Sets the cause select options to list object
function setCauseSelect(list){
    if (causeSelectInit) causeSelect.empty();
    
    causeSelect = $('#causeSelect').select2({
        width:'77%',
        placeholder:"Selecciona un causa",
        data:list,
        dropdownParent: $('#timeAllocationModal')
    })
    causeSelectInit = true;
}

/* Comment Select */
// Sets the comment select options to list object
function setCommentSelect(){
    if (commentSelectInit) commentSelect.empty();
    
    commentSelect = $('#commentSelect').select2({
        width:'73%',
        placeholder:"Escribe un comentario",
        dropdownParent: $('#timeAllocationModal'),
        tags: true
    })
    commentSelectInit = true;
}

/* Allocation Modal */
// Modal Submit
$(document).ready(function(){
    $('#timeAllocationForm').on('submit', function(event){
        event.preventDefault();
        var selectedBusinessText = businessSelect.find('option:selected').text()
        var belongsToBusiness = selectedBusinessText.includes(userDataJson.site)
        var bussinesFOCode = businessSelect.find('option:selected').text().substring(0, 2);
        var formData = {
            date: formatDate($('#dateInputModal').val()),
            bussinesFOCode: bussinesFOCode,
            belongsToBusiness: belongsToBusiness,
            isMachine: getSelectedOption(),
            machineId: machineSelect.val(),
            projectIdList: projectSelect.val(),
            taskCode: taskSelect.val(), 
            causeCode: causeSelect.val(),
            isReprocess: $('#reworkCheck').prop('checked') ? '2' : '1',
            time: timeToHours($('#timeInput').val()),
            comment: commentSelect.val(),
        };
        var jsonData = JSON.stringify(formData);

        $.ajax({
            url: timeCreateAllocationUrl,
            type: 'POST',
            contentType: 'application/json',
            data: jsonData,
            headers: { 'X-CSRFToken': csrfToken },
            success: function(response, status, xhr){
                var modal = bootstrap.Modal.getInstance(document.getElementById('timeAllocationModal'));
                modal.hide();                
                var message = 'La imputación se guardó correctamente'

                if(editInProgress){
                    var formData = {
                        allocationId: deleteData.IDPROImputation,
                        bussinesFOCode: deleteData.codPlanta,
                        comment: deleteData.coment,
                        time: deleteData.tiempo.replace(',','.'),
                    };
                    var jsonData = JSON.stringify(formData);
        
                    $.ajax({
                        url: timeDeleteAllocationUrl,
                        type: 'POST',
                        contentType: 'application/json',
                        data: jsonData,
                        headers: { 'X-CSRFToken': csrfToken },
                        error: function(response){
                            console.log(response.responseJSON.message)
                        }
                    });
                    message = 'La imputación se editó correctamente'
                }

                // Global notification
                $.ajax({
                    url: notificationUrl,
                    method: 'POST',
                    data: {
                        'message': message,
                    },
                    success: function(response){
                        console.log(response);                        
                    },
                    error: function(response){
                        console.log(error)
                    }
                });
                var date = formatDate($('#dateInput').val())

                getTimeAllocations(date);
                getMachineTimeAllocations(date);                
            },
            error: function(response){
                console.log(response)
            }
        });
    });
});
// Modal Close
$('#timeAllocationModal').on('hidden.bs.modal', function (e){
    $('#timeAllocationLabel').html(`<i class='bx bx-plus' style="color: #444444;"></i> Nueva imputación`)
    employeeDataTable.rows().deselect();
    machineDataTable ? machineDataTable.rows().deselect() : null;
    businessSelect.find('option').each(async function(){
        if ($(this).text().includes(userDataJson.site)){
            if (businessSelect.val() !== $(this).val()){
                businessSelect.val($(this).val()).trigger('change');
            }
        }
    });
    projectSelect.val(null).trigger('change');
    machineSelect.val(null).trigger('change');
    taskSelect ? taskSelect.val(null).trigger('change'):null
    causeSelect.val(null).trigger('change');
    commentSelect.val(null).trigger('change');
    $('#dateInputModal').val($('#dateInput').val())
    $('#timeInput').val(null)

    $('#reworkCheck').prop('checked', false);
    $('#option1').prop('checked', true);
    editInProgress = false
});

/* Edit */
// Edit Event
$('#employeeDataTable, #machineDataTable').on('click', 'button.btn-edit', async function(){
    editInProgress = true
    
    var isEmployeeTable = $(this).closest('table').attr('id') === 'employeeDataTable';
    var dataTable = isEmployeeTable ? employeeDataTable : machineDataTable;
    var row = $(this).closest('tr');
    var rowData = dataTable.row(row).data();
    deleteData = rowData;
    
    await handleEdit(row, rowData, dataTable);
    
    var searchText = isEmployeeTable ? rowData.desMaquina : rowData.desRecurso;    
    machineSelect.find('option').each(function() {
    if ($(this).text().includes(searchText)) {
        if (machineSelect.val() !== $(this).val()) {
            machineSelect.val($(this).val()).trigger('change');
        }
    }
});
});
// Edit Handler
async function handleEdit(row, rowData, dataTable){
    businessChange = false;
    projectChange = false;

    $('#timeAllocationLabel').html(`<i class="bx bx-calendar-edit" style="color: #444444;"></i> Editar imputación`);
    dataTable.rows().deselect();
    dataTable.row(row).select();

    businessSelect.find('option').each(function(){
        if ($(this).text().includes(rowData.desPlanta)){
            if (businessSelect.val() !== $(this).val()){
                businessSelect.val($(this).val()).trigger('change');
            }
        }
    });
    rowData.tipoRecurso == '1' ? $('#option1').prop('checked', true) : $('#option2').prop('checked', true);
    await setProjectList();
    projectSelect.val(rowData.IDProject).trigger('change');

    await setTaskList();
    taskSelect.val(rowData.codTarea).trigger('change');
    causeSelect.val(rowData.codImprod).trigger('change');
    $('#timeInput').val(formatTime(rowData.tiempo.replace(',', '.')));
    rowData.codTipoHora == '1' ? $('#reworkCheck').prop('checked', false) : $('#reworkCheck').prop('checked', true);
    
    var tagValue = rowData.coment;
    if (commentSelect.find("option[value='" + tagValue + "']").length){
        commentSelect.val(tagValue).trigger('change');
    } else {
        var newOption = new Option(tagValue, tagValue, true, true);
        commentSelect.append(newOption).trigger('change');
    }
}

/* Delete */ 
// Delete Event
$('#employeeDataTable, #machineDataTable').on('click', 'button.btn-delete', handleDeleteButtonClick);
// Delete Button Handler
function handleDeleteButtonClick(event){
    var table = $(this).closest('table').DataTable();
    var row = $(this).closest('tr');
    deleteData = table.row(row).data();
    table.rows().deselect();
    table.row(row).select();
}
// Delete Modal Submit
$(document).ready(function(){
    $('#deleteAllocationForm').on('submit', function(event){
        event.preventDefault();
        var formData = {
            allocationId: deleteData.IDPROImputation,
            bussinesFOCode: deleteData.codPlanta,
            comment: deleteData.coment,
            time: deleteData.tiempo.replace(',','.'),
        };
        var jsonData = JSON.stringify(formData);

        $.ajax({
            url: timeDeleteAllocationUrl,
            type: 'POST',
            contentType: 'application/json',
            data: jsonData,
            headers: { 'X-CSRFToken': csrfToken },
            success: function(response, status, xhr){
                var modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllocationModal'));
                modal.hide();
                
                // Global notification
                $.ajax({
                    url: notificationUrl,
                    method: 'POST',
                    data: {
                        'message': 'La imputación se eliminó correctamente',
                    },
                    success: function(response){
                        console.log(response);                        
                    },
                    error: function(response){
                        console.log(error)
                    }
                });
                var date = formatDate($('#dateInput').val())
                getTimeAllocations(date);
                getMachineTimeAllocations(date);                
            },
            error: function(response){
                console.log(response.responseJSON.message)
            }
        });
    })
});
// Delete Modal Close
$('#deleteAllocationModal').on('hidden.bs.modal', function (e){
    employeeDataTable.rows().deselect();
    machineDataTable ? machineDataTable.rows().deselect() : null;
});

/* Change Event Listeners */
$(document).ready(function(){
    // Listens for change in date
    $('#dateInput').on('input', function(){    
       var dateValue = $('#dateInput').val();
        if (isValidDate(dateValue)){
            $('#dateInputModal').val(dateValue);
            var formattedDate = formatDate(dateValue);
            getTimeAllocations(formattedDate);
            getMachineTimeAllocations(formattedDate);
        }else{
            $('#dateInput').focus(function(){ this.setSelectionRange(0, 2); });
        }
   });
   // For Radio buttons
   $('input[name="options"]').change(function(){
       showHideMachineSelect()
       taskSelect ? setTaskList() : null
   });
   // For Business list
   $('#businessSelect').on('change', function(){
       !businessChange ? businessChange = true : setProjectList();        
   });
   // For Project list
   $('#projectSelect').on('change', async function(){        
       var projectSelectValue = projectSelect.val()
       if (!projectSelectValue.length) return;
       
       if(projectSelectValue.includes(indirectProjectId)){
           $('#taskControl').addClass('d-none');
           $('#causeControl').removeClass('d-none');
           if(projectSelectValue.length > 1) projectSelect.val(indirectProjectId);                 
       }else{
           $('#causeControl').addClass('d-none');
           $('#taskControl').removeClass('d-none');
       } 

       var newFirstProjectId = projectSelectValue[0]
       if(newFirstProjectId !== firstProjectId){
           firstProjectId = newFirstProjectId
           if(!projectChange){
               projectChange = true;
           }else{
               await setTaskList()
               showHideMachineSelect()
           }
       }       
   });
   // For Task list
   $('#taskSelect').on('change', function(){ showHideMachineSelect() });
});

/* Time Input Handler */
$(document).ready(function(){
    const timeInput = $('#timeInput')
    timeInput.focus(function(){ $(this).select() });

    timeInput.blur(function(){
        const formattedTime = formatTime(timeInput.val());
        if (formattedTime) timeInput.val(formattedTime)
    });
});

/* General functions */
// Get selected option
function getSelectedOption(){
    return $('input[name="options"]:checked').val();
}
// Show or hide Machine select
function showHideMachineSelect(){
    var selectedOption = getSelectedOption()
    var selectedTask
    taskSelect ? selectedTask = taskSelect.find('option:selected').text() : selectedTask = ''
    selectedOption == 1 || selectedTask.includes('CAM') || selectedTask.includes('CNC') ? $('#machineControl').removeClass('d-none'):$('#machineControl').addClass('d-none')
    !(getSelectedOption()>0) && (selectedTask.includes('CAM') || selectedTask.includes('CNC'))? machineSelect.val(null).trigger('change') : null
}
// Check for valid date
function isValidDate(date){
    dateSplit = date.split('-')
    // Parse date components
    var day = parseInt(dateSplit[2], 10);
    var month = parseInt(dateSplit[1], 10) - 1;
    var year = parseInt(dateSplit[0], 10);

    // Check if date is a valid calendar date
    var dateObject = new Date(year, month, day);
    if (dateObject.getFullYear() !== year || dateObject.getMonth() !== month || dateObject.getDate() !== day){
        return false;
    }    
    // Check if date is not in the future
    var today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time 
    if (dateObject > today) return false;

    // Check if the date is not more than a year in the past
    var oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    if (dateObject < oneYearAgo) return false;

    return true;
}