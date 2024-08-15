// Data table initialization
let dataTable;
let dataTableIsinitialized = false;

// Data table initialization settings
const dataTableOptions = {
    layout: {
        topStart: {
            buttons: [
                {text: "Crear nuevo <i class='bx bx-plus' ></i>",attr:{type: 'button',"data-bs-toggle":"modal","data-bs-target":"#newUserModal"},className: 'btn btn-dark btn-sm',
                action: function (e, dt, node, config) {listAvailableUsers()}},
                {extend:'colvis', text:'Ocultar/Mostrar', className: 'btn btn-dark btn-sm'},
                {extend:'pageLength',  text: "Filas", className: 'btn btn-dark btn-sm'},
                'spacer',
                {text:"<i class='bx bx-refresh' style='font-size: 1rem;'></i> Refrescar ", className: 'btn btn-dark btn-sm', action: function(e, dt, node, config){initDataTable()}},
                'spacer',
                {extend:'excel', text:"<i class='bx bxs-file-export'></i> Exportar", className:'btn btn-dark btn-sm',split:['excel','csv','pdf','copy']},
        ]
        }
    },
    columnDefs:[
        {orderable:false, targets:[3,4]},
        {searchable:false, targets:[0,3,4]}
    ],
    select: {
        style:'api'
    },
    paging: true,
    destroy: true,
    responsive:true,
    pageLength:10,    
    scrollCollapse: false,
    autoFill: false,
    scrollY: "65vh",

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
        dataTable.destroy();
    }
    await listUsers();
    dataTable = $('#usersDataTable').DataTable(dataTableOptions)
    dataTableIsinitialized=true;
}
// Get users list
const listUsers = async()=>{
    try {
        const response = await fetch("http://127.0.0.1:8000/ek_admin/list_users/");
        const data = await response.json();
        let content = ``;
        data.rows.forEach((user, index) => {
            content += `
            <tr>
                <td>${index+1}</td>
                <td>${user.cell[0]}</td>
                <td>${user.cell[1]}</td>
                <td>${user.cell[2]}</td>
                <td>
                    <button class="btn btn-sm btn-dark btn-edit" type="button" data-bs-toggle="modal" data-bs-target="#editUserModal"><i class='bx bxs-edit'></i></button>
                    <button class="btn btn-sm btn-secondary btn-delete" type="button" data-bs-toggle="modal" data-bs-target="#deleteUserModal"><i class='bx bx-trash-alt' ></i></button>
                </td>
            </tr>
            `;
        });
        tableBody_users.innerHTML = content;
    } catch (error) {
        alert(error)
    }
}
// Gets available users to create a new one
async function listAvailableUsers(){
    try {
        const response = await fetch("http://127.0.0.1:8000/ek_admin/create_user/");
        const data = await response.json();
        availableUserSelect.innerHTML = data.users;        
    } catch (error) {
        alert(error)        
    }
}

// Submit Actions //

// Create Action
$(document).ready(function() {
    $('#createUserForm').on('submit', function(event) {
        event.preventDefault(); 

        var formData = {
            availableUserSelect: $('#availableUserSelect').val(),
            newUserPassword: $('#newUserPassword').val()
        };

        var jsonData = JSON.stringify(formData);
        var csrfToken = $('[name=csrfmiddlewaretoken]').val();

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            contentType: 'application/json',
            data: jsonData,
            headers: { 'X-CSRFToken': csrfToken },
            success: function(response, status, xhr) {
                console.log(response)
                var modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
                modal.hide();
                
                // Global notification
                $.ajax({
                    url: notificationUrl,
                    method: 'POST',
                    data: {
                        'message': 'Se ha creado un nuevo usuario!',
                    },
                    success: function(response) {
                        console.log(response);                        
                    },
                    error: function(response) {
                        console.log(error)
                    }
                });
                initDataTable()
            },
            error: function(response) {
                console.log(response.responseJSON.message)
                $('#createFeedbackMessage').text(response.responseJSON.message);
            }
        });
    });
});

// Edit Action
$(document).ready(function(){
    $('#editUserForm').on('submit', function(event){
        
        event.preventDefault();
        var formData = {
            userName: user,
            password1: $('#editUserPassword1').val(),
            userCode: userCode
        }
        password2 = $('#editUserPassword2').val()
        
        var jsonData = JSON.stringify(formData)
        var csrfToken = $('[name=csrfmiddlewaretoken]').val();
        if (formData.password1 == password2) {
            $.ajax({
                url: $(this).attr('action'),
                type: $(this).attr('method'),
                contentType: 'application/json',
                data: jsonData,
                headers: {'X-CSRFToken': csrfToken},
                success: function(response){
                    console.log(response);
                    var modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                    modal.hide();

                // Global notification
                $.ajax({
                    url: notificationUrl,
                    method: 'POST',
                    data: {
                        'message': 'Se ha editado un usuario',
                    },
                    success: function(response) {
                        console.log(response);                        
                    },
                    error: function(response) {
                        console.log(error)
                    }
                });
                initDataTable()

                },
                error: function (response){
                    console.log(response.responseJSON.message)
                    $('editFeedbackMessage').text(response.responseJSON.message);
                }
    
            })            
        }
        else
        {
            $('#editFeedbackMessage').text('Las contraseñas no coinciden');
        }


    })
})

// Delete Action
$(document).ready(function(){
    $('#deleteUserForm').on('submit', function(event){
        event.preventDefault();
        var formData = {
            userCode: userCode
        }        
        var jsonData = JSON.stringify(formData)
        var csrfToken = $('[name=csrfmiddlewaretoken]').val();

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            contentType: 'application/json',
            data: jsonData,
            headers: {'X-CSRFToken': csrfToken},
            success: function(response){
                console.log(response);
                var modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
                modal.hide();

            // Global notification
            $.ajax({
                url: notificationUrl,
                method: 'POST',
                data: {
                    'message': 'Se ha eliminado un usuario',
                },
                success: function(response) {
                    console.log(response);                        
                },
                error: function(response) {
                    console.log(error)
                }
            });
            initDataTable()

            },
            error: function (response){
                console.log(response.responseJSON.message)
                $('deleteFeedbackMessage').text(response.responseJSON.message);
            }
        })                   
    })
})

// Buttons // 

// Edit Button
$('#tableBody_users').on('click', 'button.btn-edit', function(){
    var row = $(this).closest('tr');
    var rowData = dataTable.row(row).data();
    dataTable.rows().deselect();
    dataTable.row(row).select();
    userCode = rowData[1];
    user = rowData[2];
    password = rowData[3];

    $('#editUserName').val(`${userCode} -  ${user}`)
})

// Delete Button
$('#tableBody_users').on('click', 'button.btn-delete', function(){
    var row = $(this).closest('tr');
    var rowData = dataTable.row(row).data();
    dataTable.rows().deselect();
    dataTable.row(row).select();
    userCode = rowData[1];
    user = rowData[2];
    password = rowData[3];

    $('#deleteUserName').val(`${userCode} -  ${user}`)
})

// On Create Modal-close //

//On Create Modal close
$('#newUserModal').on('hidden.bs.modal', function (e) {
    $(this).find('form').trigger('reset');
});

//On Edit-Modal close
$('#editUserModal').on('hidden.bs.modal', function (e) {
    $(this).find('form').trigger('reset');
    dataTable.rows().deselect();
});

//On Delete-Modal close
$('#deleteUserModal').on('hidden.bs.modal', function (e) {
    $(this).find('form').trigger('reset');
    dataTable.rows().deselect();
});

// Initialices table on load
window.addEventListener("load", async()=>{
    await initDataTable();
});