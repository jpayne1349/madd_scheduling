
// @ts-check

// global variables

var version_number = '0.4.1';

var monthNames = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

var day_count = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

var colorList = ['rgb(224, 226, 115)', 'rgb(226, 115, 115)', 'rgb(115, 226, 130)', 'rgb(226, 169, 115)' ,
    'rgb(200, 115, 226)', 'gb(226, 115, 180)', 'rgb(115, 226, 226)' , '' , '' , '' , '' , '' , '' , '']

var colorList2 = ['rgb(230, 25, 75)', 'rgb(60, 180, 75)', 'rgb(255, 225, 25)', 'rgb(0, 130, 200)', 'rgb(245, 130, 48)', 'rgb(145, 30, 180)', 'rgb(70, 240, 240)', 'rgb(240, 50, 230)', 'rgb(210, 245, 60)', 'rgb(250, 190, 212)', 'rgb(0, 128, 128)', 'rgb(220, 190, 255)', 'rgb(255, 250, 200)', 'rgb(170, 255, 195)', 'rgb(128, 128, 0)', 'rgb(255, 215, 180)', 'rgb(0, 0, 128)', 'rgb(128, 128, 128)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']

var secondRowCount = 0;

var thirdRowCount = 0;

// this will have mulitple purposes, for now it will help display the employee blocks
var employeeList = [];


/*
    Notes:

        feature ideas:
          - avoid employees with same first and last name?
                duplicate lastnames, should display username instead of lastname?
          - 
          - set a max # of employees at 15
          -
          - track the # of days signed up for in the current week. all should be 3.  
          -
          - stat panel, with a Reassigned count column on the right
                and an individual stat selector on the left
                like a scroll wheel or whatever to pick the person you want to see.


          UI Work:
          -
          - 
          -
          -

          BUGS:
          - after deletion of employee, blocks do not shift. new blocks not placed in empty spot

*/


var initial_date = new Date();

initialDisplay(initial_date);
//logPointer();


//**********************************************************************************************************

// class for employee creation
class Employee {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;

        this.username = firstName.slice(0,1) + lastName;
    }

}

// calls getDates and weekTemplate to display the information
function initialDisplay(date_object) {
    
    addVersionNumber();
    createViewToggle();
    let week_template = createWeekTemplate();
    createForm();
    createEmployeeColumn();
    windowResizeListener();
    
    let dates_object = getDates(date_object);

    for(let i = 0; i < 7; i++) {
        let day_headers = $('.day_header');
        let date = document.createElement('div');
        date.className = 'date';
        date.classList.add(dates_object.month_array[i]);
        date.innerText = dates_object.date_array[i];

        day_headers[i].appendChild(date);
    }
    let month_div = week_template[7];
    month_div.classList.add(date_object.getFullYear());
    month_div.classList.add(dates_object.month_array[0]);
    let title_string = monthNames[findMajorityMonth(dates_object.month_array)];
    month_div.innerText = title_string;

    createStatPanel();
    loadAssignmentsFromDatabase(date_object);

}

// add version element
function addVersionNumber() {
    let version_div = document.createElement('div');
    version_div.className = 'version';
    version_div.innerText = 'v'+ version_number;

    let page = document.getElementById('main_content');
    page.appendChild(version_div);
}

// builds day grid and returns the html divs for each in an array
function createWeekTemplate() {
    
    let day_div_array = [];

    let week_div = document.createElement('div');
    week_div.classList.add('week_div');

    let month_name_div = document.createElement('div');
    month_name_div.classList.add('month_name_div');
    month_name_div.id = 'month_name';

    let previous_div = document.createElement('div');
    previous_div.classList.add('previous_div');

    let previous_button = document.createElement('div');
    previous_button.classList.add('previous_button');
    previous_button.addEventListener('click', function() { previousWeek() });
    let prev_line_one = document.createElement('div');
    prev_line_one.className = 'prev_line_one';
    let prev_line_two = document.createElement('div');
    prev_line_two.className = 'prev_line_two';
    previous_button.appendChild(prev_line_one);
    previous_button.appendChild(prev_line_two);

    previous_div.appendChild(previous_button);

    let next_div = document.createElement('div');
    next_div.classList.add('next_div');

    let next_button = document.createElement('div');
    next_button.classList.add('next_button');
    next_button.addEventListener('click', function () { nextWeek() });
    let next_line_one = document.createElement('div');
    next_line_one.className = 'next_line_one';
    let next_line_two = document.createElement('div');
    next_line_two.className = 'next_line_two';
    next_button.appendChild(next_line_one);
    next_button.appendChild(next_line_two);

    next_div.appendChild(next_button);

    week_div.appendChild(previous_div);

    for(let i = 0; i < 7; i++) {
        
        let day_div = document.createElement('div');
        day_div.className = "day_div";
        day_div.classList.add(i.toString());

        let day_header = document.createElement('div');
        day_header.classList.add('day_header');

        let day_name = document.createElement('div');
        day_name.className = 'day_name';
        day_name.innerText = dayNames[i];

        day_header.appendChild(day_name);
        day_div.appendChild(day_header);
        week_div.appendChild(day_div);
        
        day_div_array.push(day_div);
    }
    day_div_array.push(month_name_div);

    week_div.appendChild(next_div);

    let page = document.getElementById('main_content');
    page.appendChild(month_name_div);
    //page.appendChild(previous_div);
    page.appendChild(week_div);
    //page.appendChild(next_div);

    return day_div_array;

}

// builds html objects for creating the employee
function createForm() {

    let form_div = document.createElement('div');
    form_div.classList.add('form_div');

    let hide_form_arrow = document.createElement('div');
    hide_form_arrow.className = 'hide_form_arrow';
    hide_form_arrow.addEventListener('click', function () { toggleForm(); });

    let form_arrow_one = document.createElement('div');
    form_arrow_one.className = 'form_arrow_one';

    let form_arrow_two = document.createElement('div');
    form_arrow_two.className = 'form_arrow_two';

    hide_form_arrow.appendChild(form_arrow_one);
    hide_form_arrow.appendChild(form_arrow_two);

    let employee_form = document.createElement('form');
    employee_form.name = 'employee_form';
    employee_form.className = 'employee_form';

    let first_name_input = document.createElement('input');
    first_name_input.className = 'first_name_input';
    first_name_input.placeholder = 'First Name';
    first_name_input.name = 'fname';
    first_name_input.addEventListener('keypress', function (event) {
        if (event.keyCode == 13) { createEmployee(); }
    });

    let last_name_input = document.createElement('input');
    last_name_input.className = 'last_name_input';
    last_name_input.placeholder = 'Last Name';
    last_name_input.name = 'lname';
    last_name_input.addEventListener('keypress', function(event) {
        if(event.keyCode == 13) { createEmployee(); }
    });

    let create_button = document.createElement('button');
    create_button.className = 'create_button';
    create_button.innerText = 'Create';
    create_button.addEventListener('click', function() { createEmployee(); });

    let validation_div = document.createElement('div');
    validation_div.className = 'validation_div';

    let f_validation = document.createElement('div');
    f_validation.className = 'f_validation';
    
    let l_validation = document.createElement('div');
    l_validation.className = 'l_validation';
    
    let page = document.getElementById('main_content');

    employee_form.appendChild(first_name_input);
    employee_form.appendChild(last_name_input);
    employee_form.appendChild(validation_div);

    validation_div.appendChild(f_validation);
    validation_div.appendChild(l_validation);

    form_div.appendChild(hide_form_arrow);
    form_div.appendChild(employee_form);
    form_div.appendChild(create_button);
    
    page.appendChild(form_div);

}

// moves the form and arrow back and forth, and expands the day_divs
function toggleForm() {
    let the_inputs = $('.employee_form');
    let the_button = $('.create_button');
    let toggle_arrow = $('.hide_form_arrow');
    let day_divs = $('.day_div');

    the_inputs[0].classList.toggle('form_hide');
    the_button[0].classList.toggle('form_hide');
    toggle_arrow[0].classList.toggle('move_arrow');
    
    for(let i = 0; i < day_divs.length; i++) {
        day_divs[i].classList.toggle('form_hidden');
    }
    
}

// displays error messages for empty forms, and invalid characters
function validateForm(f_entered, l_entered, f_invalid, l_invalid) {

    let first_name_entered = f_entered
    let last_name_entered = l_entered
    let fname_invalid = $(f_invalid);
    let lname_invalid = $(l_invalid);
    let first_flag = false;
    let last_flag = false;

    let regex_pattern = /\W|_/g;
    let first_name_search = first_name_entered.search(regex_pattern);
    let last_name_search = last_name_entered.search(regex_pattern);

    if (first_name_search != -1) {
        first_flag = true;
        fname_invalid[0].innerText = 'No Special Characters or Spaces';
    }
    if (last_name_search != -1) {
        last_flag = true;
        lname_invalid[0].innerText = 'No Special Characters or Spaces';
    }

    if (first_name_entered == '' || last_name_entered == '') {
        if (first_name_entered == '') {
            first_flag = true;
            fname_invalid[0].innerText = 'First Name Required';
        }
        if (last_name_entered == '') {
            last_flag = true;
            lname_invalid[0].innerText = 'Last Name Required';
        }
    }

    if (first_flag == true || last_flag == true) {
        if (first_flag != true) {
            fname_invalid[0].innerText = '';
        }
        if (last_flag != true) {
            lname_invalid[0].innerText = '';
        }
        return false;
    } else {
        return true;
    }
}

// adds the div to the page
function createEmployeeColumn() {

    let employee_column_div = document.createElement('div');
    employee_column_div.id = 'employee_column_div';
    employee_column_div.style.opacity = '0';

    let page = document.getElementById('main_content');

    page.appendChild(employee_column_div);

    loadEmployeesFromDatabase();

    setTimeout( function() {
        employee_column_div.style.opacity = '1';
    }, 400 );
}

// creates listener to reload employee column at resize
function windowResizeListener() {

    const once = {
        once: true
    };

    window.addEventListener('resize', reloadEmployeeColumn, once);

}

// called at window resize?
function reloadEmployeeColumn() {
    
    //grab all the shit.
    let all_employees = $('#employee_column_div');
    all_employees[0].remove();
    employeeList = [];
    secondRowCount = 0;
    thirdRowCount = 0;

    setTimeout( function() { 
        createEmployeeColumn();

        setTimeout( windowResizeListener, 2000 );
    
    } , 1000) ;
}

// make a view toggle for changing classification of days
function createViewToggle() {

    let change_views_div = document.createElement('div');
    change_views_div.className = 'change_views_div';

    let requested_label = document.createElement('div');
    requested_label.className = 'requested_label';
    requested_label.innerText = 'Requested';

    requested_label.classList.add('requested_active');
    
    let assigned_label = document.createElement('div');
    assigned_label.className = 'assigned_label';
    assigned_label.innerText = 'Assigned';
    
    let toggle_slider_housing = document.createElement('div');
    toggle_slider_housing.className = 'toggle_slider';
    toggle_slider_housing.addEventListener('click', function () { changeViews(); });
    
    let toggle_button = document.createElement('div');
    toggle_button.id = 'toggle_button';
    toggle_button.className = 'requested';

    toggle_button.style.backgroundColor = 'rgb(47, 171, 248)';
    
    toggle_slider_housing.appendChild(toggle_button);
    change_views_div.appendChild(requested_label);
    change_views_div.appendChild(toggle_slider_housing);
    change_views_div.appendChild(assigned_label);

    let page = document.getElementById('main_content');
    page.appendChild(change_views_div);

}

// function to swap displayed assignments
function changeViews() {

    let button = $('#toggle_button');
    let current_class = button[0].className;
    
    let requested_label = $('.requested_label');
    let assigned_label = $('.assigned_label');

    let day_divs = $('.day_div');
    
    if(current_class == 'requested') {
        button[0].className = 'assigned';
        requested_label[0].classList.remove('requested_active');
        assigned_label[0].classList.add('assigned_active');
        button[0].style.backgroundColor = 'rgb(248, 125, 43)';
        button[0].style.transform = 'translate(1.2vw, 0)'

        for(let i = 0; i < day_divs.length; i++) {
            day_divs[i].style.backgroundColor = 'rgba(250, 181, 135, 0.787)';
        }

        createPopulateButton();
        
    } else {
        button[0].className = 'requested';
        requested_label[0].classList.add('requested_active');
        assigned_label[0].classList.remove('assigned_active');
        button[0].style.backgroundColor = 'rgb(47, 171, 248)';
        button[0].style.transform = 'translate(0, 0)'

        let populate_div = $('.populate_div');
        populate_div[0].style.opacity = '0';
        
        deleteElement(populate_div);
        
        for (let i = 0; i < day_divs.length; i++) {
            day_divs[i].style.backgroundColor = 'rgba(135, 206, 250, 0.787)';
        }
    }

    let useless_date = pullDateFromPage();
    changeAssignments(useless_date);

}

// create the button and put it on the page
function createPopulateButton() {

    let populate_div = document.createElement('div');
    populate_div.className = 'populate_div';
    
    let populate_button = document.createElement('div');
    populate_button.className = 'populate_button';
    populate_button.innerText = 'Populate';
    populate_button.addEventListener('click', function () { populateFromRequested();});

    populate_div.appendChild(populate_button);
    populate_div.style.opacity = '0';

    let page = $('#main_content');
    page[0].appendChild(populate_div);

    setTimeout(function() { populate_div.style.opacity = '1'; } , 600 );
    
}

// AJAX request to duplicate the current 'requested' assignments and make them 'assigned' assignments
function populateFromRequested() {

    if(confirm('This will duplicate the entries made in the Requested View. Do not use once entries are made in Assigned View. "Cancel" to not perform action.')) {
    
        let date = pullDateFromPage();

        let date_object = getDates(date);

        let month_array = date_object.month_array;
        let day_array = date_object.date_array;
        let year = date_object.year;

        let packet_array = [month_array, day_array, year]

        let json_packet = JSON.stringify(packet_array)

        $.ajax({
            type: "POST",
            url: '/populateFromRequested/',
            data: json_packet,
            success: success,
            error: fail,
            contentType: 'application/json',
            dataType: 'json'
        });

        function success(assignment_list) {
            for (let i = 0; i < assignment_list.length; i++) {
                for (let j = 0; j < assignment_list[i].length; j++) {
                    if (assignment_list[i][j] != 'None') {
                        // produces the username here
                        placeAssignmentIntoDiv(assignment_list[i][j], i);
                    }
                }
            }
        }

        function fail() {
            console.log('load assignmentz ajax failed');
        }

    }
}

// AJAX request to server to load and display saved employees
function loadEmployeesFromDatabase() {

    $.ajax({
        type: "POST",
        url: '/loadEmployee/',
        success: success,
        error: fail,
        contentType: 'application/json',
        dataType: 'json'
    });

    function success(employee_list) {
        
        for( let count = 0; count < employee_list.length; count++) {

            // parse out all employees received
            // create new Employee class object
            // call displayEmployeeObject with new object

            let firstN = employee_list[count].firstName;
            let lastN = employee_list[count].lastName;

            let loaded_employee = new Employee(firstN, lastN);

            displayEmployeeObject(loaded_employee);

        }
    }

    function fail() {
        console.log('load employees ajax failed');
    }

}

// adds employee divs to the column
function displayEmployeeObject(employee) {
    let employee_block = document.createElement('div');
    employee_block.className = 'employee_block';
    employee_block.classList.add(employee.username);
    
    let employee_name = document.createElement('div');
    employee_name.className = 'employee_name';
    employee_name.innerText = employee.firstName;

    employee_block.appendChild(employee_name);

    let dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdownMenu';
    dropdownMenu.classList.add(employee.username);

    let dropdownButton = document.createElement('div');
    dropdownButton.className = 'dropdownButton';
    
    let dropDotOne = document.createElement('div');
    dropDotOne.className = 'dropDotOne';
    let dropDotTwo = document.createElement('div');
    dropDotTwo.className = 'dropDotTwo';
    let dropDotThree = document.createElement('div');
    dropDotThree.className = 'dropDotThree';

    dropdownButton.appendChild(dropDotOne);
    dropdownButton.appendChild(dropDotTwo);
    dropdownButton.appendChild(dropDotThree);

    dropdownMenu.appendChild(dropdownButton);

    // formatting the weird grid array that makes the duplicate function work properly...
    employeeList.push(employee_block);
    let block_width = window.innerWidth * 0.14;
    let block_left = (employeeList.length-1) * block_width + 20;

    if( block_left > window.innerWidth * .90 ) {
        let spacing = window.innerWidth * .035;
        let first_row_top = window.innerWidth * .40;
        let new_top = first_row_top + spacing;
        employee_block.style.top = (new_top) + 'px';

        let menu_spacing = window.innerWidth * .031
        dropdownMenu.style.top = (new_top + menu_spacing) + 'px';
        
        let old_row = $('.employee_block');
        
        block_left = parseInt(old_row[secondRowCount].style.left);
        secondRowCount+=1;

        if (secondRowCount > 7) {
            let next_top = new_top + (window.innerWidth * .075);
            employee_block.style.top = next_top + 'px';
            let third_spaceing = window.innerWidth * .0315;
            dropdownMenu.style.top = (next_top + third_spaceing) + 'px';
        }
    }

    let custom_color = colorList2[employeeList.length - 1];

    employee_block.style.backgroundColor = custom_color;

    employee_block.style.left = (block_left) + 'px';
    dropdownMenu.style.left = (block_left) + 'px';

    createEmployeeButtons(dropdownMenu, dropdownButton, employee, custom_color);
    

    let employee_column = document.getElementById('employee_column_div');
    employee_column.appendChild(employee_block);
    employee_column.appendChild(dropdownMenu);
    
    dragElement(employee_block, false);
}

// add the buttons on the div to delete/edit employee
function createEmployeeButtons(menu_div, button, employee, color) {
    
    let button_div = document.createElement('div');
    button_div.className = 'button_div';
    
    let delete_div = document.createElement('div');
    delete_div.className = 'delete_div';
    delete_div.innerText = 'Delete';
    
    delete_div.addEventListener('click', function () {
        deleteEmployeeFromDatabase(employee);
    });

    let edit_div = document.createElement('div');
    edit_div.className = 'edit_div';
    edit_div.innerText = 'Edit';

    edit_div.addEventListener('click', function () { displayEditModal(employee, color) });

    button_div.appendChild(edit_div);
    button_div.appendChild(delete_div);

    button.addEventListener('click', function () {
        toggleAsChild(menu_div, button_div);
    });
}

// function to display an edit box? also needs to call another function for database change
function displayEditModal(employee, color) {

    let modal_div = document.createElement('div');
    modal_div.className = 'modal_div';

    let modal_header = document.createElement('div');
    modal_header.className = 'modal_header';
    modal_header.innerText = 'Edit ' + employee.firstName + ' ' + employee.lastName;
    modal_header.style.backgroundColor = color;

    let edit_form_div = document.createElement('div');
    edit_form_div.className = 'edit_form_div';

    let edit_first_name_input = document.createElement('input');
    edit_first_name_input.className = 'edit_first_name_input';
    edit_first_name_input.placeholder = 'First Name';
    edit_first_name_input.name = 'edit_fname';
    edit_first_name_input.addEventListener('keypress', function (event) {
        if (event.keyCode == 13) { 
            if (validateEditForm()) {
                editEmployeeInDatabase(employee, edit_first_name_input.value, edit_last_name_input.value);
                modal_div.style.opacity = '0';
                deleteElement(modal_div);
            }
         }
    });

    let edit_last_name_input = document.createElement('input');
    edit_last_name_input.className = 'edit_last_name_input';
    edit_last_name_input.placeholder = 'Last Name';
    edit_last_name_input.name = 'edit_lname';
    edit_last_name_input.addEventListener('keypress', function (event) {
        if (event.keyCode == 13) {  
            if (validateEditForm()) {
                editEmployeeInDatabase(employee, edit_first_name_input.value, edit_last_name_input.value);
                modal_div.style.opacity = '0';
                deleteElement(modal_div);
            }
        }
    });

    let submit_button = document.createElement('div');
    submit_button.className = 'submit_button';
    submit_button.innerText = 'Submit';
    submit_button.addEventListener('click', function () { 
        if(validateEditForm()) {
            editEmployeeInDatabase(employee, edit_first_name_input.value, edit_last_name_input.value);
            modal_div.style.opacity = '0';
            deleteElement(modal_div); 
        }
    });

    let cancel_button = document.createElement('div');
    cancel_button.className = 'cancel_button';
    cancel_button.innerText = 'Cancel';
    cancel_button.addEventListener('click', function() { 
        modal_div.style.opacity = '0';
        deleteElement(modal_div);
    } );

    let buttons_row = document.createElement('div');
    buttons_row.className = 'buttons_row';

    let validation_row = document.createElement('div');
    validation_row.className = 'validation_row';

    let edit_f_validation = document.createElement('div');
    edit_f_validation.className = 'edit_f_validation';

    let edit_l_validation = document.createElement('div');
    edit_l_validation.className = 'edit_l_validation';

    validation_row.appendChild(edit_f_validation);
    validation_row.appendChild(edit_l_validation);

    buttons_row.appendChild(cancel_button);
    buttons_row.appendChild(submit_button);
    
    modal_div.appendChild(modal_header);

    edit_form_div.appendChild(edit_first_name_input);
    edit_form_div.appendChild(edit_last_name_input);
    
    modal_div.appendChild(edit_form_div);
    modal_div.appendChild(validation_row);
    modal_div.appendChild(buttons_row);
    

    let page = document.getElementById('main_content');
    page.appendChild(modal_div);

    removeOnOutsideClick();

    function validateEditForm() {
        if(validateForm(edit_first_name_input.value, edit_last_name_input.value, edit_f_validation, edit_l_validation)) {
            return true;
        } else {
            return false;
        }

    }

    function removeOnOutsideClick() {

        setTimeout( function() {
        
            window.onclick = function(event) {
                if(event.target == modal_div || event.target == modal_header || event.target == edit_form_div ||
                    event.target == edit_first_name_input || event.target == edit_last_name_input ||
                    event.target == buttons_row || event.target == submit_button || event.target == cancel_button ||
                    event.target == validation_row || event.target == edit_f_validation || event.target == edit_l_validation) {

                } else {
                    modal_div.style.opacity = '0';
                    deleteElement(modal_div);
                }
            }
        }, 500 );

    }
}

function editEmployeeInDatabase(old_employee, new_first_name, new_last_name) {

    let old_first = old_employee.firstName;
    let old_last = old_employee.lastName;

    let packet_array = [old_first, old_last, new_first_name, new_last_name]

    let data = JSON.stringify(packet_array);

    $.ajax({
        type: "POST",
        url: '/editEmployee/',
        data: data,
        success: success,
        error: fail,
        contentType: 'application/json'
    });

    function success(response) {
        setTimeout(function() {
            let useless_date = pullDateFromPage();
            changeAssignments(useless_date);
        } , 2000);

        reloadEmployeeColumn();
    }

    function fail() {
        console.log('editEmployeeInDatabase() failed');
    }


}

// add or remove child from parent 
function toggleAsChild(parent, child) {
    // this could search the childNodes list, to be better
    if(child == parent.childNodes[1]) {
        parent.removeChild(child);
    } else {
        parent.appendChild(child);
    }
}

// processes form submission, returns a new employee object
function createEmployee() {
    if (validateForm(document.forms['employee_form']['fname'].value, document.forms['employee_form']['lname'].value,
                    '.f_validation', '.l_validation' )) {

        let first_name = document.forms['employee_form']['fname'].value;
        let last_name = document.forms['employee_form']['lname'].value;
        
        let new_employee = new Employee(first_name, last_name);

        clearForm();

        addEmployeeToDatabase(new_employee);

        displayEmployeeObject(new_employee);
    }
}

// call on button press to load previous week data
function previousWeek() {

    let current_date = pullDateFromPage();
    let current_date_arrays = getDates(current_date);
    let previous_sunday = current_date.getDate() - 7;
    let new_date = new Date(current_date.getFullYear(), current_date.getMonth(), previous_sunday);
    let new_date_arrays = getDates(new_date);
    
    changeMonth(current_date_arrays.month_array, new_date_arrays.month_array);
    changeAssignments(new_date);
    changeDates(new_date_arrays.date_array, current_date_arrays.month_array, new_date_arrays.month_array);

}

// call on button press to load next week data
function nextWeek() {

    let current_date = pullDateFromPage();
    let current_date_arrays = getDates(current_date);
    let next_sunday = current_date.getDate() + 7;
    let new_date = new Date(current_date.getFullYear(), current_date.getMonth(), next_sunday);
    let new_date_arrays = getDates(new_date);
    
    changeMonth(current_date_arrays.month_array, new_date_arrays.month_array);
    changeAssignments(new_date);
    changeDates(new_date_arrays.date_array, current_date_arrays.month_array, new_date_arrays.month_array);

}

// check the month array and change title if necessary
function changeMonth(previous_month_array, new_month_array) {

    let current_month = findMajorityMonth(previous_month_array);
    let new_month = findMajorityMonth(new_month_array);
    
    if( new_month != current_month) {
        let month_div = $('#month_name');
        month_div[0].style.opacity = '0';
        month_div[0].classList.remove(current_month);
        month_div[0].classList.add(new_month);
        setTimeout(function() {
            month_div[0].innerText = monthNames[new_month]; 
            month_div[0].style.opacity = '1';
        }, 400);
    }
}

// clear dates, add new dates, using fade effect
function changeDates(date_array, old_month_array, new_month_array) {
    let dates = $('.date');
    for (let i = 0; i < dates.length; i++) {
        dates[i].style.opacity = '0';
        dates[i].classList.remove(old_month_array[i]);
        dates[i].classList.add(new_month_array[i]);
        setTimeout(function () {
            dates[i].innerText = date_array[i];
            dates[i].style.opacity = '1'; }, 400 );
    }
}

// clear the assignments without deleting them from database, call load assignments with new Date
function changeAssignments(date) {
    // get all the assignments currently displayed and remove them.
    let assignments = $('.assigned_employee_block');
    for( let i = 0; i < assignments.length; i ++ ) {
        assignments[i].style.opacity = '0';
        deleteElement(assignments[i]);
    }
    // call loadAssignments with the new date
    setTimeout(function () { loadAssignmentsFromDatabase(date); } , 400);

}

// returns a date object corresponding to the first day of the week
function pullDateFromPage() {
    let month_element = document.getElementById('month_name');
    let year = month_element.classList[1];
    
    let dates = $('.date');
    let day = dates[0].innerText;
    let month = dates[0].classList[1];

    let date_obj = new Date(parseInt(year), parseInt(month), parseInt(day));

    return date_obj

}

// ajax request to server to add employee object to database
function addEmployeeToDatabase(employee) {

    let data = JSON.stringify(employee);

    $.ajax({
        type: "POST",
        url: '/createEmployee/',
        data: data,
        success: success,
        error: fail,
        contentType: 'application/json'
    });

    function success(response) {
        //console.log(response);
    }

    function fail() {
        console.log('addEmployeeToDatabase() failed');
    }

}

// ajax request to server to delete employee, deletes all assignments as well.
function deleteEmployeeFromDatabase(employee) {

    let data = JSON.stringify(employee);

    $.ajax({
        type: "POST",
        url: '/deleteEmployee/',
        data: data,
        success: success,
        error: fail,
        contentType: 'application/json'
    });

    function success(response) {
    
        deleteEmployeeFromJavascript(response);
    }

    function fail() {
        console.log('deleteEmployeeFromDatabase() failed');
    }


}

// removing javascript objects with classname that matches username argument
function deleteEmployeeFromJavascript(username) {
    let username_string = "." + username;

    $(username_string).remove();

}

// ajax request to server to create assignment in db
function addAssignmentToDatabase(element, day_index, date) {

    let username = element.classList[0];
    
    let date_object = getDates(date);
    
    let month = date_object.month_array[day_index];
    let day = date_object.date_array[day_index];
    let year = date_object.year;

    let view_button = $('#toggle_button');
    let classification = view_button[0].className;
    
    let packet_array = [username, month, day, year, classification]
    
    let json_to_send = JSON.stringify(packet_array)

    $.ajax({
        type: "POST",
        url: '/addAssignment/',
        data: json_to_send,
        success: success,
        error: fail,
        contentType: 'application/json'
    });

    function success(response) {
        //console.log(response);
    }

    function fail() {
        console.log('addAssignmentToDatabase() failed');
    }


}

// deletes an assignment from the database that is moved out of a day
function deleteAssignmentFromDatabase(element, day_index, date) {
    if(element.classList[2] == 'saved_previously') {
        
        let username = element.classList[0];

        let date_object = getDates(date);
        
        let month = date_object.month_array[day_index];
        let day = date_object.date_array[day_index];
        let year = date_object.year;

        let view_button = $('#toggle_button');
        let classification = view_button[0].className;

        let packet_array = [username, month, day, year, classification]

        let json_to_send = JSON.stringify(packet_array)

        $.ajax({
            type: "POST",
            url: '/deleteAssignment/',
            data: json_to_send,
            success: success,
            error: fail,
            contentType: 'application/json'
        });

        function success(response) {
            //console.log(response);
        }

        function fail() {
            console.log('deleteAssignmentFromDatabase() failed');
        }

    }
}

// load the assignments of the current week? for now until week changes implemented
function loadAssignmentsFromDatabase(date) {
    
    let date_object = getDates(date);
    let month_array = date_object.month_array;
    let date_array = date_object.date_array;
    let year = date_object.year;

    let view_button = $('#toggle_button');
    let classification = view_button[0].className;

    let data_array = [month_array, date_array, year, classification];
    let json_packet = JSON.stringify(data_array);

    $.ajax({
        type: "POST",
        url: '/loadAssignments/',
        data: json_packet,
        success: success,
        error: fail,
        contentType: 'application/json',
        dataType: 'json'
    });

    function success(assignment_list) {
        // day loop
        for( let i = 0; i < assignment_list.length; i++) {
            // assignment loop
            for( let j = 0; j < assignment_list[i].length; j++) {
                // if none, do something with the first and last name
                if( assignment_list[i][j] != 'None') {
                    let first_name = assignment_list[i][j][0];
                    let last_name = assignment_list[i][j][1];
                    // first name at 0, last name at 1

                    placeAssignmentIntoDiv(first_name, last_name, i );
                }
            }
        }
    }

    function fail() {
        console.log('load assignmentz ajax failed');
    }

}

// simple. pulls the div out with a certain class. prob not necessary
function findParentBlock(block_list) {
    for(let each = 0; each < block_list.length; each++) {
        if(block_list[each].classList.contains('employee_block')) {
            return block_list[each];
        }
    }
}

// called in load assignments to display them
function placeAssignmentIntoDiv(first_name, last_name, day_index) {
    let username = first_name.slice(0,1) + last_name;
    let username_blocks = $('.' + username);
    let parent_block = findParentBlock(username_blocks);
    let parent_color = parent_block.style.backgroundColor;
    
    
    let new_block = document.createElement('div');
    new_block.classList.add(username);
    new_block.classList.add('assigned_employee_block');
    new_block.style.backgroundColor = parent_color;
    let new_name = document.createElement('div');
    new_name.classList.add('employee_name');
    new_name.innerText = first_name;

    new_block.appendChild(new_name);
    new_block.style.opacity = '0';
    
    dragElement(new_block, true);

    let days_list = $('.day_div');
    days_list[day_index].appendChild(new_block);
    setTimeout( function() { new_block.style.opacity = '1'; } , 200);

    let pos = $(new_block).position();
    new_block.style.top = pos.top + 'px';
    new_block.style.left = pos.left + 'px';
    
}

// sets form values to '', clearz validation messages
function clearForm() {

    document.forms['employee_form']['fname'].value = '';
    document.forms['employee_form']['lname'].value = '';

    let fname_validation = $('.f_validation');
    fname_validation[0].innerText = '';

    let lname_validation = $('.l_validation');
    lname_validation[0].innerText = '';

}

// returns an object holding a month array, date array, and year integer
function getDates(date) {
    let month_num = date.getMonth(); // 0 to 11
    let month = getMonthName(month_num);
    let year = date.getFullYear();
    let week_day_index = date.getDay(); // 0 to 6
    let month_day = date.getDate(); //  to 31
    let previous_month = month_num - 1;
    let next_month = month_num + 1;
    
    var week_dates = {month_array:[], date_array:[], year:year};

    if ( month_day < 7 ) {
        let week_start = day_count[previous_month] - (week_day_index-month_day);
        for ( let counter = 0; counter < 7; counter++ ) {
            let date = counter + week_start;
            week_dates.month_array.push(previous_month);
            if( date > day_count[previous_month]) { 
                date -= day_count[previous_month];
                week_dates.month_array[counter] = month_num; 
            }
            week_dates.date_array.push(date);
        }
        return week_dates;

    } else if ( day_count[month_num] - month_day < 7 ) {
        for ( let counter = 0; counter < 7; counter++ ) {
            let date = counter + (month_day - week_day_index);
            week_dates.month_array.push(month_num);
            if(date > day_count[month_num]) { 
                date -= day_count[month_num];
                week_dates.month_array[counter] = next_month;
            }
            week_dates.date_array.push(date);
        }

        return week_dates;

    } else {
        for ( let counter = 0; counter < 7; counter++ ) {
            let date = counter + (month_day - week_day_index);
            week_dates.month_array.push(month_num);
            week_dates.date_array.push(date);
        }
        return week_dates;
    }
    
}

// converts a number to a month name string
function getMonthName(number) {
    return monthNames[number];
}

// returns an integer for the month to be displayed above the week
function findMajorityMonth(month_array) {
    // pull numbers out of the array and see which one occurs most often

    let monthOne = month_array[0];
    let countOne = 0;
    let monthTwo = month_array[6];
    let countTwo = 0;

    for(let i = 0; i < month_array.length; i++) {
        if(monthOne == month_array[i]) {
            countOne++;
        } else {
            countTwo++;
        }
    }
    if(countOne > countTwo) {
        return monthOne;
    } else {
        return monthTwo;
    }
}

// can call independently to show pointer position in console
function logPointer() {
    let pointer = document.addEventListener('pointermove', function (event) {

        console.log(event.clientX, event.clientY);
        });

}

// sets the appropriate listeners on an element to make it draggable
function dragElement(elmnt, clone_boolean=false) {

    var cursorX = 0, cursorY = 0, offsetX = 0, offsetY = 0;

    elmnt.onmousedown = function() { dragMouseDown(event); }

    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        cursorX = e.clientX;
        cursorY = e.clientY;

        //establish top and left location of object
        var obj = $(elmnt).position();
        offsetX = cursorX - obj.left;
        offsetY = cursorY - obj.top;

        let elmnt_top_position = cursorY - offsetY;
        let elmnt_left_position = cursorX - offsetX;

        let cloned_elmnt = null;

        if(clone_boolean==false) {
            cloned_elmnt = duplicate(elmnt, elmnt_top_position, elmnt_left_position);
        } else {
            let day = elmnt.parentElement;
            var index = day.classList[1];

            removeElementFromDiv(elmnt.parentNode, elmnt);
            deleteAssignmentFromDatabase(elmnt, index, pullDateFromPage());
        }

        document.onmouseup = function() { closeDragElement(event, elmnt, cloned_elmnt);  }
        

        document.onmousemove = function() { elementDrag(event, cloned_elmnt, offsetX, offsetY); }

    }

    function elementDrag(e, clone, xOffset, yOffset) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position:
        cursorX = e.clientX;
        cursorY = e.clientY;

        if(clone_boolean == false) {
            // set the element's new position:
            clone.style.top = (cursorY - yOffset) + "px";
            clone.style.left = (cursorX - xOffset) + "px";
        } else {
            elmnt.style.top = (cursorY - yOffset) + "px";
            elmnt.style.left = (cursorX - xOffset) + "px";
        }

    }

    function closeDragElement(e, element, clone) {
        let dropped_element;

        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position:
        cursorX = e.clientX;
        cursorY = e.clientY;

        if (clone == null) {
            dropped_element = element;
        } else {
            dropped_element = clone;
        }

        let divDroppedOn = getDivOnDrop(cursorX, cursorY);

        if(divDroppedOn == null) {
            dropped_element.style.opacity = '0';
            deleteElement(dropped_element);

        } else {
            insertElementIntoDiv(divDroppedOn, dropped_element);
            
            addAssignmentToDatabase(dropped_element, divDroppedOn, pullDateFromPage());
        }

        
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// returns a copy of the element passed in. copy is draggable as a clone.
function duplicate(employee_element, startingTop, startingLeft) {
    
    let new_element = employee_element.cloneNode(true);    

    let column = $('#employee_column_div');
    column[0].appendChild(new_element);

    dragElement(new_element, true);

    return new_element;

}

// returns integer corresponding to day div the pointer is over
function getDivOnDrop(pointerX, pointerY) {
    
    let divPositions = dayDivPositions();
    let divSize = getDayDivSize();

    for(let i = 0; i < divPositions.length; i++) {
    let xStart = divPositions[i][0];
    let yStart = divPositions[i][1];

    let xEnd = xStart + divSize.width;
    let yEnd = yStart + divSize.height;
    
        if (pointerX >= xStart && pointerX <= xEnd && pointerY >= yStart && pointerY <= yEnd) {
            return i;
        }
    }
}

// returns an array of lenth 2 arrays containing the top and left pixel values for each day div
function dayDivPositions() {
    let day_divs = $('.day_div');
    let position_array = [];
    let week_div = $('.week_div');
    let week_position = $(week_div[0]).position();
    
    let day_position = $(day_divs[0]).position();
    let all_tops = week_position.top + day_position.top;

    for( let i = 0; i<day_divs.length; i++) {
        let div_position = $(day_divs[i]).position();
        let div_position_array = [];
        div_position_array.push(div_position.left);
        div_position_array.push(all_tops);
        position_array.push(div_position_array);
        
    }

    return position_array;
}

// returns an objects containing .width and .height attributes for the day divs 
function getDayDivSize() {

    let size = {width:null, heigth:null}

    let day_divs = $('.day_div');

    size.width = day_divs[0].clientWidth;
    size.height = day_divs[0].clientHeight;

    return size;

}

// adds the fade class to the element before removing it altogether
function deleteElement(element) {
    setTimeout(function() {element.remove();}, 400); 

}

// changes classes of the element and appends it to the day div[number] provided
function insertElementIntoDiv(div_number, element) {
    let day_divs = $('.day_div');

    element.classList.remove('employee_block');
    element.classList.add('assigned_employee_block');
    $(day_divs[div_number]).append(element);

    // setting new element position, so drag works correctly
    var pos = $(element).position();

    element.style.top = pos.top + 'px';
    element.style.left = pos.left + 'px';
}

// removes element from parent, called on block pickup
function removeElementFromDiv(element_parent, element) {
    let day_divs = $('.day_div');
    let day_index = element_parent.classList[1];
    
    //$(day_divs[day_index]).remove(element);
    element.classList.remove('assigned_employee_block');
    element.classList.add('employee_block');
    element.classList.add('saved_previously');
    

}

// not using
function createStatTable() {

    let table_div = document.createElement('div');
    table_div.className = 'table_div';

    let table_wrapper = document.createElement('table');
    table_wrapper.className = 'table_wrapper';

    let row1 = document.createElement('tr');
    row1.className = 'row1';

    let table_header = document.createElement('th');
    table_header.className = 'table_header';
    table_header.colSpan = 4;
    table_header.innerText = 'Employee Statistics';

    let row2 = document.createElement('tr');
    row2.className = 'row2';

    let name_col_header = document.createElement('th');
    name_col_header.className = 'name_col_header';
    name_col_header.innerText = 'Name';

    let days_requested_col = document.createElement('th');
    days_requested_col.className = 'days_requested_col';
    days_requested_col.innerText = '# of Days Requested';

    let days_assigned_col = document.createElement('th');
    days_assigned_col.className = 'days_assigned_col';
    days_assigned_col.innerText = '# of Days Assigned';

    let days_moved_col = document.createElement('th');
    days_moved_col.className = 'days_moved_col';
    days_moved_col.innerText = '# of Days Moved';

    row2.appendChild(name_col_header);
    row2.appendChild(days_requested_col);
    row2.appendChild(days_assigned_col);
    row2.appendChild(days_moved_col);

    row1.appendChild(table_header);

    table_wrapper.appendChild(row1);
    table_wrapper.appendChild(row2);

    table_div.appendChild(table_wrapper);

    let page = $('#main_content');
    page[0].appendChild(table_div);
}

// make the outline for a employee stats slide up panel
function createStatPanel() {

    let stat_panel_div = document.createElement('div');
    stat_panel_div.className = 'stat_panel_div';

    let stat_panel_button = document.createElement('div');
    stat_panel_button.className = 'stat_panel_button';

    let stat_button_line1 = document.createElement('div');
    stat_button_line1.className = 'stat_button_line1';

    let stat_button_line2 = document.createElement('div');
    stat_button_line2.className = 'stat_button_line2';

    stat_panel_button.appendChild(stat_button_line1);
    stat_panel_button.appendChild(stat_button_line2);

    stat_panel_button.addEventListener('click', function () { toggleStatPanel(stat_panel_div, stat_button_line1, stat_button_line2); });

    let reassigned_column = document.createElement('div');
    reassigned_column.className = 'reassigned_column';

    let column_title = document.createElement('div');
    column_title.className = 'column_title';
    column_title.innerText = 'Reassigned Leaderboard';

    let employee_sel_title = document.createElement('div');
    employee_sel_title.className = 'employee_sel_title';
    employee_sel_title.innerText = 'Select Employee';

    let employee_selector = document.createElement('select');
    employee_selector.className = 'employee_selector';

    let month_sel_title = document.createElement('div');
    month_sel_title.className = 'month_sel_title';
    month_sel_title.innerText = 'Select Month';

    let month_selector = document.createElement('select');
    month_selector.className = 'month_selector';

    createMonthOptions(month_selector);

    let requested_col_title = document.createElement('div');
    requested_col_title.className = 'requested_col_title';
    requested_col_title.innerText = 'Requested Days';

    let requested_column = document.createElement('div');
    requested_column.className = 'requested_column';

    let assigned_col_title = document.createElement('div');
    assigned_col_title.className = 'assigned_col_title';
    assigned_col_title.innerText = 'Assigned Days';

    let assigned_column = document.createElement('div');
    assigned_column.className = 'assigned_column';

    let reload_button = document.createElement('div');
    reload_button.className = 'reload_button';

    let reload_icon = document.createElement('img');
    reload_icon.className = 'reload_icon';
    reload_icon.src = 'static/reload_icon.png';

    reload_button.appendChild(reload_icon);

    reload_button.addEventListener('click', reloadPanelData);

    // add icon to reload_button?

    stat_panel_div.appendChild(stat_panel_button);
    stat_panel_div.appendChild(requested_col_title);
    stat_panel_div.appendChild(requested_column);
    stat_panel_div.appendChild(assigned_col_title);
    stat_panel_div.appendChild(assigned_column);
    stat_panel_div.appendChild(month_sel_title);
    stat_panel_div.appendChild(employee_sel_title);
    stat_panel_div.appendChild(month_selector);
    stat_panel_div.appendChild(employee_selector);
    stat_panel_div.appendChild(column_title);
    stat_panel_div.appendChild(reassigned_column);
    stat_panel_div.appendChild(reload_button);


    let page = $('#main_content');
    page[0].appendChild(stat_panel_div);
}

// move stat panel up and down
function toggleStatPanel(panel, line1, line2) {

    if(panel.classList.contains('panel_visible') != true) {
        // can set loading spinners to turn on here.
        console.log('make loading spinners');
        loadDatabaseEntries();

        
    }
    
    panel.classList.toggle('panel_visible');
    line1.classList.toggle('panel_open1');
    line2.classList.toggle('panel_open2');

}

// loads all database information. calls functions to display stat panel
function loadDatabaseEntries() {

    $.ajax({
        type: "POST",
        url: '/loadDatabaseEntries/',
        success: success,
        error: fail,
        contentType: 'application/json',
        dataType: 'json'
    });

    function success(database_info) {
        let employee_stats_list = createEmployeeStatsList(database_info);
        displayReassignedLeaderboard(employee_stats_list);
        reloadColumns(employee_stats_list);
        columnListeners(employee_stats_list);
        stopReloadSpin();
    }

    function fail() {
        console.log('load stats panel failed');
    }
    
}

// adding the months to the selector, and selecting the current month
function createMonthOptions(selector) {
    let date_object = pullDateFromPage();
    let month_num = date_object.getMonth();

    for( let i = 0; i < monthNames.length; i++) {
        let new_option = document.createElement('option');
        new_option.value = i.toString();
        new_option.innerText = monthNames[i];

        selector.appendChild(new_option);

        if(i == month_num){
            new_option.selected = true;
        }
    }

}

// processes the database info, returns a list of employee objects with appropriate attributes
function createEmployeeStatsList(database) {
    
    let employee_stats_list = [];
    let employee_selector = $('.employee_selector');

    let selector_children = $(employee_selector).children();
    selector_children.remove();

    for(let index = 0; index < database.length; index++) {
        // inside, building employee object with stats to put into the list.
        let employee_object = {
            // adding in attributes as the function is hashed out
        }

        employee_object.employee_full_name = database[index][0][0] + ' ' + database[index][0][1];
        employee_object.employee_first_name = database[index][0][0];
        employee_object.employee_last_name = database[index][0][1];

        let new_option = document.createElement('option');
        new_option.value = index.toString();
        new_option.innerText = employee_object.employee_full_name;

        employee_selector[0].appendChild(new_option);

        employee_object.employee_requested_list = [];
        employee_object.employee_assigned_list = [];
        employee_object.reassigned_count = 0;

        for( let assignments = 0; assignments < database[index][1].length; assignments++) {

            let assignment = database[index][1][assignments];
            
            let classification = assignment[3];

            if(classification == 'requested') {
                employee_object.employee_requested_list.push(assignment);
            } else {
                employee_object.employee_assigned_list.push(assignment);
            }

        }
        if (employee_object.employee_requested_list.length == employee_object.employee_assigned_list.length ) {
            
            employee_object.equivalent_assignments = true;
            // here we can call a reassigned days function
            for (let requested = 0; requested < employee_object.employee_requested_list.length; requested ++) {
                // gotta write something to check the assigned vs requested
                // for each requested, check all assigned values for a match\
                // do a string match?
                let requested_string = employee_object.employee_requested_list[requested][0].toString() + employee_object.employee_requested_list[requested][1] + employee_object.employee_requested_list[requested][2];
                let compare_values = [];

                for (let assigned = 0; assigned < employee_object.employee_assigned_list.length; assigned ++) {
                    let assigned_string = employee_object.employee_assigned_list[assigned][0].toString() + employee_object.employee_assigned_list[assigned][1] + employee_object.employee_assigned_list[assigned][2];
                
                    let match_value = requested_string.localeCompare(assigned_string);
                    compare_values.push(match_value);                 
                    
                    // if match_value == 0 , exit loop and do nothing
                    if( match_value == 0) {
                        break
                    }
                    // if loop finishes without matching, then increment reassigned_count
                    if (assigned == employee_object.employee_assigned_list.length - 1) {
                        employee_object.reassigned_count++;
                    }
                }   
            }
        } else {
            employee_object.equivalent_assignments = false;
        }
        employee_stats_list.push(employee_object);
    }
    return employee_stats_list;
}

// sort the people by reassigned values and display them to the leaderboard
function displayReassignedLeaderboard(stats_list) {

    let leaderboard_length = 10;

    let ranked_list = JSON.parse(JSON.stringify(stats_list));

    ranked_list.sort(function(a , b) {
        let value1 = a.reassigned_count;
        let value2 = b.reassigned_count;

        if(value1 < value2) { return 1; }
        if(value2 < value1) { return -1; }
        return 0;

    });
    // stats list is now sorted in ascending order, make the blocks and display them

    let leaderboard = $('.reassigned_column');

    let previous_blocks = leaderboard.children();
    previous_blocks.remove();

    for( let employee = 0; employee < ranked_list.length; employee++) {

        let employee_username = ranked_list[employee].employee_first_name.slice(0, 1) + ranked_list[employee].employee_last_name;

        let leaderboard_block = document.createElement('div');
        leaderboard_block.className = 'leaderboard_block';
        leaderboard_block.style.backgroundColor = getParentColor(employee_username);    

        let leaderboard_name = document.createElement('div');
        leaderboard_name.className = 'leaderboard_name';
        leaderboard_name.classList.add(employee_username);
        leaderboard_name.innerText = ranked_list[employee].employee_full_name;
        
        let reassigned_number = document.createElement('div');
        reassigned_number.className = 'reassigned_number';
        reassigned_number.innerText = ranked_list[employee].reassigned_count;

        leaderboard_block.appendChild(leaderboard_name);
        leaderboard_block.appendChild(reassigned_number);

        leaderboard[0].appendChild(leaderboard_block);

        if(employee >= leaderboard_length) {
            break;
        }
    }

    function getParentColor(username) {
        let employee_block_list = $('.employee_block');
        for( let i = 0; i < employee_block_list.length; i++) {
            if(employee_block_list[i].classList.contains(username)) {
                return employee_block_list[i].style.backgroundColor;
            }
        }

    }

}

// set up the individual stats columns with data to reference?
function columnListeners(stats_list) {

    let employee_selector = $('.employee_selector');
    employee_selector[0].addEventListener('change', function () { reloadColumns(stats_list); });

    let month_selector = $('.month_selector');
    month_selector[0].addEventListener('change', function () { reloadColumns(stats_list); });
}

// called on selector change..
function reloadColumns(stats_list) {
    
    let month_selector = $('.month_selector');
    //@ts-ignore
    let month_selected = month_selector[0].selectedIndex;

    let employee_selector = $('.employee_selector');
    //@ts-ignore
    let employee_selected = employee_selector[0].selectedIndex;


    let requested_column = $('.requested_column');
    let previous_dates = requested_column.children();
    previous_dates.remove();

    let list_of_requested = [];

    let assigned_column = $('.assigned_column');
    let prev_dates = assigned_column.children();
    prev_dates.remove();

    let list_of_assigned = [];

    for( let index = 0; index < stats_list[employee_selected].employee_requested_list.length; index++) {
        if (stats_list[employee_selected].employee_requested_list[index][0] == month_selected) { 
            let requested_day_block = document.createElement('div');
            requested_day_block.className = 'requested_day_block';

            let requested_date = document.createElement('div');
            requested_date.className = 'requested_date';
            requested_date.innerText = stats_list[employee_selected].employee_requested_list[index][1];

            requested_day_block.appendChild(requested_date);

            list_of_requested.push(requested_day_block);
            
        }
    }
    
    sortDates(list_of_requested, requested_column[0]);

    for (let index = 0; index < stats_list[employee_selected].employee_assigned_list.length; index++) {
        if (stats_list[employee_selected].employee_assigned_list[index][0] == month_selected) { 
            let assigned_day_block = document.createElement('div');
            assigned_day_block.className = 'assigned_day_block';

            let assigned_date = document.createElement('div');
            assigned_date.className = 'assigned_date';
            assigned_date.innerText = stats_list[employee_selected].employee_assigned_list[index][1];

            assigned_day_block.appendChild(assigned_date);

            list_of_assigned.push(assigned_day_block);
            
        }
    }

    sortDates(list_of_assigned, assigned_column[0]);


}

// helper function for reloadColumns
function sortDates(list_of_date_elements, column) {

    list_of_date_elements.sort(function(a, b) {
        let one = a.childNodes[0].innerText;
        let two = b.childNodes[0].innerText;

        if (one < two) { return -1; }
        if (two < one) { return 1; }
        return 0;

    });
   
    for( let each = 0; each < list_of_date_elements.length; each++) {
        column.appendChild(list_of_date_elements[each]);
    }

}

// reload button in panel
function reloadPanelData() {
    let reload_icon = $('.reload_icon');
    reload_icon[0].classList.add('reload_spin');
    loadDatabaseEntries();
}

// simple check to run in the loadDatabaseEntries function
function stopReloadSpin() {
    let reload_icon = $('.reload_icon');
    // be cool to set the animation-interval to 1. and then stop it.
    if( reload_icon[0].classList.contains('reload_spin')) {
        reload_icon[0].style.animationIterationCount = '1';
        setTimeout( function() {

            reload_icon[0].classList.remove('reload_spin');
            reload_icon[0].style.animationIterationCount = 'infinite';

        }, 1000);
    }
}




// ? for unequal assignments?

// loading spinners

// full calendar view in requested/assigned columns

// work on visuals alittle