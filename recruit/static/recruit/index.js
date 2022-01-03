let counter = 0;
const quantity = 2;
const numVacancies = parseInt(document.querySelector('#number-active-vacancies').innerHTML);

document.addEventListener('DOMContentLoaded', function(){

    // try{
    //     document.querySelector('#candidate-registration-login').style.display = 'none';
    //     document.querySelector('#employer-registration-login').style.display = 'none';
    // } catch(err){
    //     console.log(err)
    // }
    document.querySelector('#job-details-view').style.display = 'none';
    document.querySelector('#about-us-view').style.display = 'none';

    
    


    loadVacancies();
    // paginationArrows();

    document.querySelector('#right-arrow').addEventListener('click', function(){
        if (counter >= numVacancies){
            return;
        } else {
            document.querySelector('.fa-chevron-left').style.color = 'black';
            clearVacancyList();
            loadVacancies();
        }
        
    })

    document.querySelector('#left-arrow').addEventListener('click', function(){
        if (counter == quantity){
            return;
        } else {
            clearVacancyList();
            counter = counter - quantity*2;
            loadVacancies();
        }
        
    })

    
    



    document.querySelector('a[class="navbar-brand"]').addEventListener('click', function(e){
        document.querySelector('#home-page-view').style.display = 'block';
        document.querySelector('#candidate-registration-login').style.display = 'none';
        document.querySelector('#employer-registration-login').style.display = 'none';
    })





})

function loadVacancies(){

    if(numVacancies === 0){
        paginationArrows();
        return;
    }

    const start = counter;
    const end = start + quantity;
    counter = end;

    fetch(`all_active_vacancies/search?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        data.vacancies.forEach(add_vacancy);
    })

}

function add_vacancy(vacancy){
    const cardCol = document.createElement('div');
    cardCol.className = "col-4 box job-card"
    // SALARY FORMATTING
    const figure = vacancy.salary.toString()
    const a = figure.slice(0,2)
    const b = figure.slice(2,6)
    const salary = `£${a},${b}`
    // DEADLINE FORMATTING
    // const vacancyDeadline = `${vacancy.deadline}`.toString();
    // const deadlineDate = new Date(vacancyDeadline);
    // const date = deadlineDate.getDate();
    // const month = deadlineDate.toLocaleString("default", { month: "short" });
    // const year = deadlineDate.getFullYear();
    // const deadline = `${date} ${month} ${year}`



    cardCol.innerHTML = `
    <div class="card border-secondary mb-3">
        <div class="card-header">${vacancy.job_title}</div>
        <div class="card-body text-secondary">
            <h5 class="card-title">${salary}</h5>
            <p class="card-text">
                <span class="job-city">${vacancy.city}</span><br>
                <span class="job-category">${vacancy.category}</span>
            </p>
            <br>
            <div class="d-flex w-100 justify-content-between"><span class="more-btn" id="${vacancy.id}">MORE</span><a href="#" class="btn btn-secondary apply-btn" data-toggle="modal" data-target="#exampleModal">Apply</a></div>
        </div>
        <div class="card-footer text-muted">Closing: <span id="vacancy-deadline">${vacancy.deadline}</span></div>
    </div>
    `
    const rightArrow = document.querySelector('#right-arrow');
    const parentNode = document.querySelector('#latest-vacancies');

    parentNode.insertBefore(cardCol, rightArrow);

    // ADD EVENT LISTENER TO MORE BUTTON
    const moreBtn = cardCol.querySelector('.more-btn')
    moreBtn.addEventListener('click', function(){
        console.log('More Btn add event listener added');
        showVacancyDetails(moreBtn.id);
    })
    // ADD EVENT LISTENER TO APPLY BUTTON
    const applyBtn = cardCol.querySelector('.apply-btn');
    applyBtn.addEventListener('click', function(){
        console.log('Apply Btn add event listener added');
        console.log(`Vacancy Id: ${vacancy.id}`);

        if (document.getElementById('user_authenticated').innerText == "False") {
            console.log("USER NOT LOGGED IN")
        } else if(document.getElementById('user-is-employer').innerText == "True") {
            console.log("USER IS AN EMPLOYER")
            alert("The 'Apply' feature is disabled on Employer accounts.")
        } else  {
            const candidateId = document.querySelector('#candidate-id').innerHTML;
            checkIfApplicant(candidateId, vacancy.id);
            // window.location.href = `vacancy/${vacancy.id}/apply/new_application`
        }
    })
    paginationArrows();
    checkVacancyList();
    console.log(document.querySelector('#latest-vacancies').getElementsByClassName('job-card').length);
}

function paginationArrows(){
    const rightArrowDiv = document.querySelector('#right-arrow');
    const latestJobs = document.querySelector('#latest-vacancies')
    ;

    const leftArrow = document.querySelector('.fa-chevron-left');
    const rightArrow = document.querySelector('.fa-chevron-right');

    if (numVacancies === 0){
        const cardCol = document.createElement('div');
        cardCol.className = "col-8 d-flex justify-content-center align-items-center my-5 box";
        cardCol.innerHTML = 'No vacancies';
        latestJobs.style.height = '250px'
        latestJobs.className = 'row mb-5';
        latestJobs.insertBefore(cardCol, rightArrowDiv);
    }
    else if(numVacancies <= quantity){
        console.log("This is an important checkpoint")
        leftArrow.style.color = 'rgb(190, 185, 185)';
        rightArrow.style.color = 'rgb(190, 185, 185)'; 
        const cardCol = document.createElement('div')
        cardCol.className = "col-4 box"
        latestJobs.insertBefore(cardCol, rightArrowDiv);
    } else if(counter >= numVacancies){
        console.log(`counter value: ${counter}`);
        console.log(`number of vacancies: ${numVacancies}`)
        const cardCol = document.createElement('div')
        cardCol.className = "col-4 box"
        latestJobs.insertBefore(cardCol, rightArrowDiv);
        rightArrow.style.color = 'rgb(190, 185, 185)';
    } else if(counter < numVacancies){
        if (counter > quantity){
            leftArrow.style.color = 'black';
            rightArrow.style.color = 'black'; 
        } else {
            leftArrow.style.color = 'rgb(190, 185, 185)';
            rightArrow.style.color = 'black'; 
        }
    }
    
    else {
        console.log("pagination arrow function: do something")
        // if(counter == quantity){
        //     leftArrow.style.color = 'rgb(190, 185, 185)';
        //     rightArrow.style.color = 'black';
        // } else if(counter == quantity*2){
        //     leftArrow.style.color = 'black';
        //     rightArrow.style.color = 'rgb(190, 185, 185)';
        // }
    }


    
    
    // else if(counter > quantity){
    //     document.querySelector('.fa-chevron-left').style.color = 'black';
    //     document.querySelector('#left-arrow').addEventListener('click', function(){
    //         counter = counter - (quantity + 1);
    //         clearVacancyList();
    //         loadVacancies();
    //     })
}

function checkVacancyList(){
    const parentNode = document.querySelector('#latest-vacancies');

    if(parentNode.childElementCount > 4){
        let boxes = document.querySelectorAll('.box');

        for (const box of boxes){
            if(box.innerHTML == ''){
                box.remove()
            }
        }
    } else {
        return;
    }
}



function clearVacancyList(){
    const parentNode = document.querySelector('#latest-vacancies');

    try {
        while(parentNode.getElementsByClassName('job-card').length > 0){
            document.querySelector('.job-card').remove(); 
        }
        
    } catch(err){
        console.log(err);
    }

}

function showVacancyDetails(id){

    document.querySelector('#home-page-view').style.display = 'none';
    try {
        document.querySelector('#search-jobs-view').style.display = 'none';
    } catch(err) {
        console.log("Cannot hide 'search-jobs-view'")
    }
    document.querySelector('#job-details-view').style.display = 'block';

    fetch(`/vacancy/${id}`)
    .then(response => response.json())
    .then(vacancy => {
        const jobId = document.querySelector('#job-id');
        const jobTitle = document.querySelector('#job-title');
        const jobSalary = document.querySelector('#job-salary');
        const jobMD = document.querySelector('#job-md');
        const jobPS = document.querySelector('#job-ps');
        const userType = document.querySelector('#user-is-employer');
        const jobContact = document.querySelector('#job-further-info');
    vacancy.forEach(function(vacancy){
        jobId.innerHTML = `Job Ref: ${vacancy.id}`;
        jobTitle.innerHTML = vacancy.job_title;
        // SALARY FORMATTING
        const figure = vacancy.salary.toString()
        const a = figure.slice(0,2)
        const b = figure.slice(2,6)
        const salary = `£${a},${b}`
        // END SALARY FORMATTING
        jobSalary.innerHTML = salary;
        jobMD.innerHTML = vacancy.main_duties;
        jobPS.innerHTML = vacancy.person_spec;
        jobContact.innerHTML = `For further information, please contact the hiring manager:<br>
        ${vacancy.employer}, ${vacancy.email}`;

        if(userType.innerHTML == "True"){
            document.querySelector('#vacancy-apply-btn').addEventListener('click', function(){
                alert("The 'Apply' feature is disabled on Employer accounts.")
            })
        } else {
            document.querySelector('#vacancy-apply-btn').addEventListener('click', function(){
                console.log("Redirect to application form")
                window.location.href = `/vacancy/${id}/apply/new_application`;
            })
        }

    })

    })
}

function checkIfApplicant(candidateId, vacancyId){
    console.log("THIS IS A CHECKPOINT!")
    $.ajax({
        type: 'GET',
        url: `/vacancy/${vacancyId}/already_applicant`,
        data: {
            candidateId: candidateId,
        },
        success: function(json) {
            console.log('checkpoint1');
            if(json["exists"]){
                console.log("CHECKPOINT 1")
                window.location.href = `home/candidate/${candidateId}/submitted_application/${vacancyId}/already_applied`;
            } else{
                console.log("CHECKPOINT 2")
                window.location.href = `vacancy/${vacancyId}/apply/new_application`;
            } 
        }
    })
}


// if(latestJobs.getElementsByClassName('job-card').length < quantity){
//     console.log(latestJobs.getElementsByClassName('job-card').length)
//     const cardCol = document.createElement('div')
//     cardCol.className = "col-4 box"
//     latestJobs.insertBefore(cardCol, rightArrowDiv);
// }