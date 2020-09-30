// @ts-check


// #login_content name of main page div..
let page = $('#login_content');


function createLoginTitle() {

    let title_div = document.createElement('div');
    title_div.className = 'title_div';
    title_div.innerText = 'Madd Scheduling';

    page[0].appendChild(title_div);
}