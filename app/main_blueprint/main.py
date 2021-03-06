


from flask import Blueprint, render_template, flash, request

from flask import current_app as app

from flask_login import login_required, current_user

from app import db

from app.models import Employee, Assignment, User, Requested_Off

import json

import time

main_blueprint = Blueprint('main_blueprint', __name__)    




@main_blueprint.route('/', methods=['GET','POST'])
@login_required
def homepage():
    return render_template('homepage.html')


@main_blueprint.route('/createEmployee/', methods=['POST'])
def create_employee():
    employee_dict = request.get_json()
    # dictionary with keys 'firstName' 'lastName' 'username'
    # Employee class attributes called first_name last_name username
    new_employee = Employee(first_name = employee_dict['firstName'],
                            last_name = employee_dict['lastName'],
                            username = employee_dict['username'],
                            user_id = current_user.id )
    db.session.add(new_employee)
    db.session.commit()

    #response to AJAX function returned
    return f'{employee_dict["username"]} added to database'

@main_blueprint.route('/loadEmployee/', methods=['POST'])
def load_employee():
    # needs to get database info and send in response
    employees = Employee.query.filter(Employee.user_id == current_user.id).all()
    
    employee_list = []
    for index, employee  in enumerate(employees):
        # individual dictionaries created for employee and placed into a list
        indiv_dict = {'firstName':employee.first_name, 'lastName':employee.last_name }
        
        employee_list.append(indiv_dict)

    json_employees = json.dumps(employee_list)

    return json_employees

@main_blueprint.route('/deleteEmployee/', methods=['POST'])
def delete_employee():
    
    employee_dict = request.get_json()
    # can just search by username for now. works unless people share last name and first initial
    stored_employee = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.username == employee_dict['username']).first()
    
    employees_assignments = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.employee == stored_employee).all()
    for assignment in employees_assignments:
        db.session.delete(assignment)

    db.session.delete(stored_employee)
    db.session.commit()

    return stored_employee.username

@main_blueprint.route('/editEmployee/', methods=['POST'])
def edit_employee():
    # change information of employee in database
    data = request.get_json()

    old_first, old_last, new_first, new_last = data[0], data[1], data[2], data[3]

    employee_to_edit = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.first_name == old_first).filter(Employee.last_name == old_last).first()

    employee_to_edit.first_name = new_first
    employee_to_edit.last_name = new_last
    employee_to_edit.username = new_first[0:1] + new_last
    db.session.commit()

    return f'edit employee route run'
    
@main_blueprint.route('/addAssignment/', methods=['POST'])
def add_assignment():
    # create the Assignment row in the table
    assignment_list = request.get_json()    
    username, month, day, year, classification = assignment_list[0], assignment_list[1], assignment_list[2], assignment_list[3], assignment_list[4]
    employee = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.username == username).first()
    # month, day, year, shift_type, employee_id
    new_assignment = Assignment(month=month, day=day, year=year, classification=classification, employee_id=employee.id, user_id=current_user.id)
    
    db.session.add(new_assignment)
    db.session.commit()

    return f'add assignment route run'

@main_blueprint.route('/deleteAssignment/', methods=['POST'])
def delete_assignment():
    assignment_list = request.get_json()    
    username, month, day, year, classification = assignment_list[0], assignment_list[1], assignment_list[2], assignment_list[3], assignment_list[4]
    employee = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.username == username).first()
    # month, day, year, shift_type, employee_id
    assignment = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.employee_id == employee.id).filter(Assignment.day == day).filter(Assignment.month == month).filter(Assignment.year == year).filter(Assignment.classification == classification).first()
    db.session.delete(assignment)
    db.session.commit()

    return f'delete assignment return'

@main_blueprint.route('/loadAssignments/', methods=['POST'])
def load_assignment():
    date_object = request.get_json()
    year = date_object[2]
    classification = date_object[3]

    response_list = []
    for i in range(7):
        response_list.append([])
        month = date_object[0][i]
        day = date_object[1][i]
        assignments = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.classification == classification).filter(Assignment.month == month).filter(Assignment.day == day).filter(Assignment.year == year).all()
        for assignment in assignments:
            response_list[i].append([assignment.employee.first_name, assignment.employee.last_name])
            
    
    json_response = json.dumps(response_list)

    return json_response

@main_blueprint.route('/populateFromRequested/', methods=['POST'])
def populate():
    date_object = request.get_json()
    year = date_object[2]
    
    response_list = []
    for i in range(7):
        response_list.append([])
        month = date_object[0][i]
        day = date_object[1][i]
        assignments = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.classification == 'requested').filter(Assignment.month == month).filter(Assignment.day == day).filter(Assignment.year == year).all()
        for assignment in assignments:
            # here is where we duplicate each assignment into an 'assigned' one
            assigned_assignment = Assignment(month=assignment.month, day=assignment.day, year=assignment.year, classification='assigned', employee_id=assignment.employee.id, user_id=current_user.id)
            db.session.add(assigned_assignment)
            response_list[i].append([assignment.employee.first_name, assignment.employee.last_name])
    
    db.session.commit()
    
    json_response = json.dumps(response_list)

    return json_response

@main_blueprint.route('/clearAssignmentsFromWeek/', methods=['POST'])
def clear():
    date_object = request.get_json()
    year = date_object[2]
    
    # each day of the week
    for day in range(7):
        # month array is '0' index, with 7 slots in it
        month = date_object[0][day]
        # day array is '0' index, with 7 slots in it
        day = date_object[1][day]

        assignments_for_this_day = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.classification == 'assigned').filter(Assignment.month == month).filter(Assignment.day == day).filter(Assignment.year == year).all()
        
        for assignment in assignments_for_this_day:
            print(f'deletiing {assignment}')
            db.session.delete(assignment)
           
    
    db.session.commit()
    
    return 'clear assignments run'

@main_blueprint.route('/loadDatabaseEntries/', methods=['POST'])
def loadEverything():
    # make the queries to send all the information to javascript?
    packet = []

    employees = Employee.query.filter(Employee.user_id == current_user.id).all()

    for employee in employees:
        entry = []

        person = []
        person.append(employee.first_name)
        person.append(employee.last_name)
        
        assignments = []

        ass_query = Assignment.query.filter(Assignment.user_id == current_user.id).filter(Assignment.employee_id == employee.id).all()
        for assignment in ass_query:
            ass = []
            ass.append(assignment.month)
            ass.append(assignment.day)
            ass.append(assignment.year)
            ass.append(assignment.classification)
            assignments.append(ass)
        
        entry.append(person)
        entry.append(assignments)
        
        packet.append(entry)

    json_packet = json.dumps(packet)

    return json_packet

@main_blueprint.route('/addRequestedOff/', methods=['POST'])
def add_requested():
    # create the Assignment row in the table
    data_list = request.get_json()    
    username, month, day, year = data_list[0], data_list[1], data_list[2], data_list[3]
    employee = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.username == username).first()
    # month, day, year, shift_type, employee_id
    new_requested_off = Requested_Off(month=month, day=day, year=year, employee_id=employee.id, user_id=current_user.id)

    db.session.add(new_requested_off)
    db.session.commit()

    return f'add requested off route run'

@main_blueprint.route('/deleteRequestedOff/', methods=['POST'])
def delete_requested():

    data_list = request.get_json()    
    username, month, day, year = data_list[0], data_list[1], data_list[2], data_list[3]
    # month and day are == None
    print(username, month, day, year)
    employee = Employee.query.filter(Employee.user_id == current_user.id).filter(Employee.username == username).first()
    # month, day, year, employee_id
    print(employee)
    requested_off = Requested_Off.query.filter(Requested_Off.user_id == current_user.id).filter(Requested_Off.employee_id == employee.id).filter(Requested_Off.day == day).filter(Requested_Off.month == month).filter(Requested_Off.year == year).first()
    print(requested_off)
    db.session.delete(requested_off)
    db.session.commit()

    return f'delete assignment return'

@main_blueprint.route('/loadRequestedOffs/', methods=['POST'])
def load_requested():

    date_object = request.get_json()
    year = date_object[2]

    response_list = []
    for i in range(7):
        response_list.append([])
        month = date_object[0][i]
        day = date_object[1][i]
        requested_offs = Requested_Off.query.filter(Requested_Off.user_id == current_user.id).filter(Requested_Off.month == month).filter(Requested_Off.day == day).filter(Requested_Off.year == year).all()
        for requested_off in requested_offs:
            response_list[i].append([requested_off.employee.first_name, requested_off.employee.last_name])
            
    if response_list == None:
        response_list.append('None')

    json_response = json.dumps(response_list)

    return json_response