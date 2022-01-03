const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const employerId = document.querySelector('#employer-id').innerHTML;

document.addEventListener('DOMContentLoaded', function(){

    showActiveVacancies();
    showClosedVacancies();
    document.querySelector('#active-vacancies-navtab').style.color = 'red';

    document.querySelector('#decision-btn').addEventListener('click', (e) => {
        console.log("Submit decision button clicked.")
        console.log(e.target.dataset.vacancyNo);
        submitDecision(e.target.dataset.vacancyNo);
    })

    document.querySelector('#close-vacancy-confirm-1').addEventListener('click', (e) => {
        console.log("Close Vacancy confirmed");
        closeVacancy(e.target.dataset.vacancyNo);
    })
    document.querySelector('#close-vacancy-confirm-2').addEventListener('click', (e) => {
        console.log("Close Vacancy confirmed");
        closeVacancy(e.target.dataset.vacancyNo);
    })
    // document.querySelector('.modal-footer').lastElementChild.addEventListener('click', (e) => {
    //     console.log("Close Vacancy confirmed");
    //     closeVacancy(e.target.dataset.vacancyNo);
    // })

    document.querySelector('.fa-calendar-plus').addEventListener('click', (e) => {
        console.log("Create interview button clicked");
        window.location.href = `/home/employer/${employerId}/vacancy/${e.target.dataset.vacancyNo}/create_interview`;
        // createInterviewView(e.target.dataset.vacancyNo);
    })

    document.querySelector('#interviews-navtab').addEventListener('click', () => {
        console.log("interview navtab has been clicked");
        window.location.href = `/home/employer/${employerId}/all_interviews`;
    })
})


function showActiveVacancies(){


    fetch(`/home/employer/${employerId}/active_vacancies`)
    .then(response => response.json())
    .then(vacancies => {
        const vacanciesList = document.querySelector('#active-vacancies-card')
        if(vacancies.length === 0){
            const vacancyCard = document.createElement('a');
            vacancyCard.className = 'list-group-item list-group-item-action flex-column align-items-start'
            vacancyCard.innerHTML = `<p>You do not have any active vacancies right now.<br><br> Please select <strong>Create Vacancy</strong> on the left to start avertising exciting roles to our candidates.</p>` 
            vacanciesList.appendChild(vacancyCard); 
        } else {
        vacancies.forEach(function(vacancy){
            const vacancyCard = document.createElement('a');
            vacancyCard.className = 'list-group-item list-group-item-action flex-column align-items-start'
            // SALARY FORMATTING
            const figure = `${vacancy.salary}`.toString()
            const a = figure.slice(0,2)
            const b = figure.slice(2,6)
            const salary = `£${a},${b}`

            vacancyCard.innerHTML = `
            <div class="d-flex w-100 justify-content-between" style="pointer-events:none;">
            <h5 class="mb-1" style="pointer-events:auto;"><strong>${vacancy.job_title}</strong></h5>
            <small>Applications Received <span class="badge badge-secondary badge-pill">${vacancy.applications}</span></small>
            </div>
            <p class="mb-1" style="pointer-events:none;">
                ${salary}<br>
                ${vacancy.category}<br>
                ${vacancy.city}
            </p>
            <p class="mb-3"><small><i>Closing: ${vacancy.deadline}</i></small></p>
            <div class="d-flex w-100 justify-content-between">
            <button class="review-app-btn" id="${vacancy.id}">Review Applications</button>
            <div>
            <button class="close-vacancy-btn" data-vacancy-no="${vacancy.id}" data-toggle="modal" data-target="#closingVacancyWarning">Close Vacancy</button>
            </div>
            </div>
            `

            // ADD EVENT LISTENER TO REVIEW APPLICATIONS BTN
            const reviewBtn = vacancyCard.querySelector('.review-app-btn');
            reviewBtn.addEventListener('click', (e) => {
                console.log("review-btn clicked");
                onReviewBtnClick(e);
            })

            // ADD EVENT LISTENER TO CLOSE APPLICATIONS BTN
            const closeVacancyBtn = vacancyCard.querySelector('.close-vacancy-btn');
            closeVacancyBtn.addEventListener('click', (e) => {
                console.log("close vacancy btn clicked");
                const closeVacancyBtn = document.querySelector('#close-vacancy-confirm-1');
                closeVacancyBtn.setAttribute('data-vacancy-no', `${e.target.dataset.vacancyNo}`);

                console.log(e.target.dataset.vacancyNo);
            })

            vacanciesList.insertBefore(vacancyCard, vacanciesList.firstElementChild);
        })
            
        }
    })
    .catch(error => {
        console.log(error);
    })

}

function showClosedVacancies(){

    fetch(`/home/employer/${employerId}/closed_vacancies`)
    .then(response => response.json())
    .then(vacancies => {
        const vacanciesList = document.querySelector('#closed-vacancies-card');
        if(vacancies.length === 0){
            const vacancyCard = document.createElement('a');
            vacancyCard.className = 'list-group-item list-group-item-action flex-column align-items-start'
            vacancyCard.innerHTML = `<p>Nothing to show here.</p>` 
            vacanciesList.appendChild(vacancyCard); 
        } else {
            vacancies.forEach(function(vacancy){
                const vacancyCard = document.createElement('a');
                vacancyCard.className = 'list-group-item list-group-item-action flex-column align-items-start'
                // SALARY FORMATTING
                const figure = `${vacancy.salary}`.toString()
                const a = figure.slice(0,2)
                const b = figure.slice(2,6)
                const salary = `£${a},${b}`
    
                vacancyCard.innerHTML = `
                <div class="d-flex w-100 justify-content-between" data-vacancy-card="${vacancy.id}" style="pointer-events:none;">
                <h5 class="mb-1" style="pointer-events:auto;"><strong>${vacancy.job_title}</strong></h5>
                <small>Applications Received <span class="badge badge-secondary badge-pill">${vacancy.applications}</span></small>
                </div>
                <p class="mb-1" style="pointer-events:none;">
                    ${salary}<br>
                    ${vacancy.category}<br>
                    ${vacancy.city}
                </p>
                <p class="mb-3"><small><i>Closed: ${vacancy.deadline}</i></small></p>
                <div class="d-flex w-100 justify-content-between">
                <button class="review-app-btn" id="${vacancy.id}">Review Applications</button>
                </div>
                `
                // NOT SURE WE NEED TO CHECK VACANCY STATUS AT THIS POINT!!
                // checkVacancyStatus(vacancy.id);

                // ADD EVENT LISTENER TO REVIEW APPLICATIONS BTN
                const reviewBtn = vacancyCard.querySelector('.review-app-btn');
                reviewBtn.addEventListener('click', (e) => {
                console.log("review-btn clicked");
                onReviewBtnClick(e);
                })

                vacanciesList.insertBefore(vacancyCard, vacanciesList.firstElementChild);
            })
                
            }
        })
        .catch(error => {
            console.log(error);
        })
    

}


function onReviewBtnClick(e){
    console.log("onReviewBtnClick function run");
    try {
        const views = document.querySelectorAll('.views');

        for (const view of views){
            view.style.display = 'none';
        }

        const tabs = document.querySelectorAll('.navbar-tabs');

        for (const tab of tabs){
            tab.style.color = 'black';
        }

        throw `${e.target.id}`

    } catch(err){
        console.log(`Review app btn clicked for Job: ${err}`)
        // document.querySelector('#review-applications-view').style.display = 'block';
        const navList = document.querySelector('.flex-column');
        const interviewsTab = document.querySelector('#interviews-navtab');
        const reviewTab = document.createElement('a');
        reviewTab.className = 'btn btn-sm btn-outline-light navbar-tabs';
        reviewTab.id = 'review-applications-navtab';
        reviewTab.innerHTML = `Review Applications - Job Ref: ${err}`
        reviewTab.style.color = 'red';
        navList.insertBefore(reviewTab, interviewsTab);
        reviewApplicationsView(err);
        
    }
    
}


function reviewApplicationsView(jobId){
    

    const jobTitle = document.querySelector('.job-title');
    const closeVacancyBtn = document.querySelector('#close-vacancy-confirm-2');
    const applicationsList = document.querySelector('.submitted-applications');

    // document.querySelector('#review-applications-view').style.display = "block";
    
    fetch(`/vacancy/${jobId}`)
    .then(response => response.json())
    .then(vacancy => {
        vacancy.forEach(function(vacancy){
            console.log(vacancy.job_title);
            jobTitle.innerHTML = `${vacancy.job_title} (Ref: ${jobId})`;
            closeVacancyBtn.setAttribute('data-vacancy-no', `${jobId}`);

            if (vacancy.applications < 1){
                try{
                    document.querySelector('#decision-btn').remove();
                    document.querySelector('.alert-info').remove();
                } catch(err){
                    console.log(err)
                }
                
                const appDiv = document.createElement('a');
                appDiv.className = 'list-group-item list-group-item-action flex-column align-items-start text-center my-5';
                appDiv.innerHTML = '<h6><b>No applications have been received for this vacancy.<b></h6>'

                applicationsList.insertBefore(appDiv, applicationsList.lastElementChild);
              

                return;
            }
        })
    })

    fetch(`/vacancy/${jobId}/applications`)
    .then(response => response.json())
    .then(applications => {
        applications.submissions.forEach(function(application){
            const appDiv = document.createElement('a');
            appDiv.className = 'list-group-item list-group-item-action flex-column align-items-start';
            appDiv.innerHTML = `<div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${application.candidate}</h5>
            <a href="${application.cv}" class="btn btn-secondary btn-sm" role="button" target="_blank">View CV</a>
            </div>
            <a class="text-decoration-none" data-toggle="collapse" href="#coverLetter${application.id}" aria-expanded="false" aria-controls="coverLetter${application.id}">Cover Letter</a>
            <div class="collapse multi-collapse" id="coverLetter${application.id}">
                <div class="card card-body">
                    <pre>${application.cover_letter}</pre>
                </div>
            </div>
            <br>
            
            <div class="form-check form-check-inline float-right" data-application-no="${application.id}">
                <input type="radio" class="form-check-input" id="shortlist" name="decisionOptions${application.id}" value="shortlist">
                <label for="shortlist" class="form-check-label mr-3">Shortlist</label>
                <input type="radio" class="form-check-input" id="reject" name="decisionOptions${application.id}" value="reject">
                <label for="reject" class="form-check-label">Reject</label>
            </div>
            <br>
            
            `
            applicationsList.insertBefore(appDiv, applicationsList.lastElementChild);
            const decisionBtn = document.querySelector('#decision-btn');
            decisionBtn.setAttribute('data-vacancy-no', jobId);
        
        })

    checkVacancyStatus(jobId); 
    console.log("THIS IS A CHECKPOINT")
  
    })
    


}


function checkVacancyStatus(vacancyId){
    $.ajax({
        type: 'GET',
        url: `/vacancy/${vacancyId}/status`,
        success: function(json) {
            if(json["active"]){
                console.log("Disable decision form, this vacancy is active");
                
                const forms = document.querySelectorAll('.form-check-inline');

                try{
                    document.querySelector('#decision-btn').disabled = true;
                } catch(err){
                    console.log("Cannot disable the submit decision button.");
                }
                
                for (const form of forms){
                    const fieldset = document.createElement('fieldset');
                    fieldset.disabled = true;

                    const formChildren = form.children
                    const formChildrenArray = Array.from(formChildren);

                    formChildrenArray.forEach((child) => {
                        fieldset.append(child)
                    })

                    // console.log(fieldset);
                    // console.log(form);

                    form.appendChild(fieldset);

                }
                
            document.querySelector('#review-applications-view').style.display = 'block';
               
            }else if(!json["active"] && json["stage"] === 1){
                    console.log("Remove info alert and close vacancy btn");
                    const alertInfo = document.querySelector('.alert-info');
                    const closeVacancyBtn = document.querySelector('.fa-window-close');
                    try {
                        alertInfo.remove();
                        closeVacancyBtn.remove();
                        document.querySelector('#decision-btn').disabled = false;
                    } catch(err){
                        if(document.contains(closeVacancyBtn)){
                            closeVacancyBtn.remove();
                        }
                        console.log("no alert or close vacancy btn to remove")
                    }
                    
    
                    const forms = document.querySelectorAll('.form-check-inline');
    
                    for (const form of forms){
    
                        try{
                            const fieldset = document.querySelector('fieldset');
    
                            const fieldsetChildren = fieldset.children
                            const fieldsetChildrenArray = Array.from(fieldsetChildren);
    
                            fieldsetChildrenArray.forEach((child) => {
                                form.append(child)
                            })
    
                            // console.log(fieldset);
                            // console.log(form);
                            
                            fieldset.remove();
    
                        } catch(err){
                            console.log("no fieldset element to remove.")
                        }
                        
    
                    }
                    if(document.querySelector('#active-closed-vacancies-view').style.display === 'none'){
                        document.querySelector('#review-applications-view').style.display = 'block'; 
                    }
                
                } else if(!json["active"] && json["stage"] === 2){
                    console.log("checkpoint 326")
                    try {
                        const views = document.querySelectorAll('.views');

                        for (const view of views){
                            view.style.display = 'none';
                        }

                        const tabs = document.querySelectorAll('.navbar-tabs');

                        for (const tab of tabs){
                            tab.style.color = 'black';
                        }

                        throw `Must show shortlisting-outcome view`
                    } catch(err){
                        console.log(`checkpoint: line 364`);
                        shortlistingOutcomeView(vacancyId);
                        document.querySelector('#review-applications-navtab').style.color = 'red';
                        // const navList = document.querySelector('.flex-column');
                        // const interviewsTab = document.querySelector('#interviews-navtab');
                        // const reviewTab = document.createElement('a');
                        // reviewTab.className = 'btn btn-sm btn-outline-light navbar-tabs';
                        // reviewTab.innerHTML = `Create an Interview - Job Ref: ${vacancyId}`
                        // reviewTab.style.color = 'red';
                        // navList.insertBefore(reviewTab, interviewsTab);
                    }
                } else if(!json["active"] && json["stage"] === 3){

                    window.location.href = `/home/employer/${employerId}/vacancy/${vacancyId}/view_interview`;

                    
                    // const reviewBtn = document.querySelector(`button[id="${vacancyId}"]`)
                    // reviewBtn.remove()
                    

                    // fetch(`/vacancy/${vacancyId}`)
                    // .then(response => response.json())
                    // .then(data => {
                    //     console.log("THIS IS A CHECKPOINT");
                    //     const interviewAlert = document.createElement('div');
                    //     interviewAlert.className = "alert alert-info";
                    //     interviewAlert.setAttribute("role", "alert");
                    //     // const employerId = document.querySelector('#employer-id').innerHTML;
                    //     const appCard = document.querySelector(`[data-vacancy-card="${vacancyId}"]`);
                    //     data.forEach(function(vacancy){
                    //         interviewAlert.innerHTML = `
                    //         <a href="/home/employer/${employerId}/vacancy/${vacancyId}/create_interview" class="alert-link">
                    //         Interviewing on ${vacancy.interview_date} at ${vacancy.interview_time}.
                    //         </a>`


                    //         appCard.parentElement.insertBefore(interviewAlert, appCard.nextElementSibling);
                    //     })
                    // })

                


                } else if(!json["active"] && json["stage"] === 4){
                    window.location.href = `/home/employer/${employerId}/vacancy/${vacancyId}/post_interview`;
                    // console.log(`Vacancy ${vacancyId} is in post-interview stage`);
                    // const reviewBtn = document.querySelector(`button[id="${vacancyId}"]`)
                    // reviewBtn.remove()
                    // document.querySelector('#review-applications-view').style.display = 'block';

                    // fetch(`/vacancy/${vacancyId}`)
                    // .then(response => response.json())
                    // .then(data => {
                    //     const interviewAlert = document.createElement('div');
                    //     interviewAlert.className = "alert alert-info";
                    //     interviewAlert.setAttribute("role", "alert");
                    //     const appCard = document.querySelector(`[data-vacancy-card="${vacancyId}"]`);
                    //     data.forEach(function(vacancy){
                    //         interviewAlert.innerHTML = `
                    //         <a href="/home/employer/${employerId}/vacancy/${vacancyId}/post_interview" class="alert-link">
                    //         <i class="fas fa-info-circle"></i> Please select a successful candidate for this job vacancy.
                    //         </a>`


                    //         appCard.parentElement.insertBefore(interviewAlert, appCard.nextElementSibling);
                    //     })
                    // })
                    


                } else {
                    console.log(json["stage"]);
                    window.location.href = `/home/employer/${employerId}/vacancy/${vacancyId}/post_interview`;
                }

                
                
            }
            
        })

}

function submitDecision(vacancyId){

    const decisionForm = document.querySelectorAll('[name^=decisionOptions]');
    const subApps = document.querySelector('.submitted-applications');
    const shortlistSelector = document.querySelectorAll('#shortlist');
    const rejectSelector = document.querySelectorAll('#reject');


    for (const selector of decisionForm){
        // console.log(decisionForm)
        // console.log(`${selector.name}: ${selector.value} , ${selector.checked}`);
        const rejectSelector = selector.parentNode.lastElementChild.previousElementSibling;
        const formDiv = selector.parentNode
        const brTag = formDiv.nextElementSibling;
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-msg float-right';
        errorMsg.innerHTML = 'Please make a selection before submitting';
        errorMsg.style.color = 'red';
        if ((selector.value == "shortlist" && selector.checked == false && rejectSelector.checked == false)){
            console.log(`no options selected for application-no${formDiv.dataset.applicationNo}`);

            if (brTag.nextElementSibling !== null){
                console.log("do not add error msg")
            } else {
                formDiv.parentNode.insertBefore(errorMsg, brTag.nextElementSibling);
            }
         

            selector.addEventListener('change', () => {
                if (selector.checked){
                    console.log("remove error message");
                    try {
                        errorMsg.remove()
                    } catch(err){
                        console.log(err)
                    }
                }
            })
            rejectSelector.addEventListener('change', () => {
                if (rejectSelector.checked){
                    console.log("remove error message"); 
                    try {
                        errorMsg.remove()
                    } catch(err){
                        console.log(err)
                    }
                }
                
            })
            
        } 

    }

    if (subApps.querySelector('.error-msg')){
        console.log("cannot submit decision because not all seclectors have been checked");
    } else {
        console.log("SUBMIT");
        
        for(const application of shortlistSelector){
            if (application.checked){
                console.log(`Selected applications: ${application.parentNode.dataset.applicationNo}`);
                shortlistingApplications(application.parentNode.dataset.applicationNo, 2);
            } 
        }

        for(const application of rejectSelector){
            if (application.checked){
                console.log(`Rejected applications: ${application.parentNode.dataset.applicationNo}`);
                shortlistingApplications(application.parentNode.dataset.applicationNo, 3);
            } 
        }

        setTimeout(() => { checkVacancyStatus(vacancyId); }, 100);
    }



    

}


function closeVacancy(vacancyId){
    $.ajax({
        type: 'POST',
        url: `/vacancy/${vacancyId}/close`,
        data: {
            csrfmiddlewaretoken: csrftoken,
        },
        success: function(json) {
            if(!json["vacancy_active"]){
                checkVacancyStatus(vacancyId);
                console.log(`Vacancy ${vacancyId} is now closed`);

                if(document.querySelector('#active-closed-vacancies-view').style.display='block'){
                    location.reload();
                } 
            }
        }

    })
}


function shortlistingApplications(applicationId, decision){
    $.ajax({
        type: 'POST',
        url: `/application/${applicationId}/shortlisting_decision`,
        data: {
            decision: decision,
            csrfmiddlewaretoken: csrftoken,
        },
        success: function(json) {
            if(json["stage"] === 'SHORTLISTED'){
                console.log(`Application ${applicationId} has been shortlisted.`);
            } else if(json["stage"] === 'REJECTED PRE-INTERVIEW'){
                console.log(`Application ${applicationId} has been rejected.`);
            }
        }
    })

}

function shortlistingOutcomeView(vacancyId){

    const jobTitle = document.querySelector('.job-title-soview');
    const calendarIcon = document.querySelector('.fa-calendar-plus');

    calendarIcon.setAttribute('data-vacancy-no', `${vacancyId}`);

    fetch(`/vacancy/${vacancyId}`)
    .then(response => response.json())
    .then(vacancy => {
        vacancy.forEach(function(vacancy){
            jobTitle.innerHTML = `${vacancy.job_title} (Ref: ${vacancyId})`;   
        })
    })

    fetch(`/vacancy/${vacancyId}/closed/shortlisted_applications`)
    .then(response => response.json())
    .then(data => {
        const appList = document.querySelector('#shortlisted-applications-list');
        data.applications.forEach(function(application){
            const appCard = document.createElement('a');
            appCard.className = 'list-group-item list-group-item-action flex-column align-items-start';
            appCard.innerHTML = `<div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${application.candidate}</h5>
            <a href="${application.cv}" class="btn btn-secondary btn-sm" role="button" target="_blank">View CV</a>
            </div>
            <a class="text-decoration-none" data-toggle="collapse" href="#coverLetter${application.id}" aria-expanded="false" aria-controls="coverLetter${application.id}">Cover Letter</a>
            <div class="collapse multi-collapse" id="coverLetter${application.id}">
                <div class="card card-body">
                    <pre>${application.cover_letter}</pre>
                </div>
            </div>`
            
            appList.appendChild(appCard);
        })
    })

    fetch(`/vacancy/${vacancyId}/closed/rejected_pre_int_applications`)
    .then(response => response.json())
    .then(data => {
        const appList = document.querySelector('#rejected-applications-list');
        data.applications.forEach(function(application){
            const appCard = document.createElement('a');
            appCard.className = 'list-group-item list-group-item-action flex-column align-items-start';
            appCard.innerHTML = `<div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${application.candidate}</h5>
            <a href="${application.cv}" class="btn btn-secondary btn-sm" role="button" target="_blank">View CV</a>
            </div>
            <a class="text-decoration-none" data-toggle="collapse" href="#coverLetter${application.id}" aria-expanded="false" aria-controls="coverLetter${application.id}">Cover Letter</a>
            <div class="collapse multi-collapse" id="coverLetter${application.id}">
                <div class="card card-body">
                    <pre>${application.cover_letter}</pre>
                </div>
            </div>`
            
            appList.appendChild(appCard);
        })
    })
    document.querySelector('#shortlisting-outcome-view').style.display = 'block';
}

