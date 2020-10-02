//// @ts-check


// login_content name of main page div..

function validateLoginForm() {

    let blank = '';
    // grab form inputs, check if none, change colors to fill out
    let username_input = $('.username_input');
    let username_value = username_input[0].value;

    let password_input = $('.password_input');
    let password_value = password_input[0].value;
    
    if( username_value == blank || password_value == blank ) {
        if( username_value == blank ) {
            username_input[0].style.borderColor = 'rgba(255, 0, 0, 0.3)';
            username_input[0].placeholder = 'Required';
        } else {
            username_input[0].style.borderColor = '#e1e4e8';
            username_input[0].placeholder = '';
        }

        if (password_value == blank) {
            password_input[0].style.borderColor = 'rgba(255, 0, 0, 0.3)';
            password_input[0].placeholder = 'Required';
        } else {
            password_input[0].style.borderColor = '#e1e4e8';
            password_input[0].placeholder = '';
        }

        return false;
    }

    return true;

}