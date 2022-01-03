let counter = 0;
const quantity = 4;
const candidateId = parseInt(document.querySelector('#candidate-id').innerHTML);

document.addEventListener('DOMContentLoaded', function(){

    const profileViewNav = document.querySelector('#navbar-profile');
    const appViewNav = document.querySelector('#navbar-applications');


    profileViewNav.style.color = 'red';
    
    // On clicking Profile tab in navbar, clear all views and only show profile-view
    profileViewNav.addEventListener('click', () => {
        try {
            const views = document.querySelectorAll('.views');

            for (const view of views){
                view.style.display = 'none';
            }

            const tabs = document.querySelectorAll('.navbar-tabs');

            for (const tab of tabs){
                tab.style.color = 'black';
            }

            throw 'Profile view must be block!'

        } catch(err){
            console.log(err)
            document.querySelector('#candidate-profile-view').style.display = 'block';
            profileViewNav.style.color = 'red';
        }
    })

    // On clicking Applications tab in navbar, clear all views and only show profile-view
    appViewNav.addEventListener('click', function(){
        console.log("A CLICKETY CLICK");
        profileViewNav.style.color = 'black';
        appViewNav.style.color = 'red';

        try {
            const views = document.querySelectorAll('.views');

            for (const view of views){
                view.style.display = 'none'
            }

            const tabs = document.querySelectorAll('.navbar-tabs');

            for (const tab of tabs){
                tab.style.color = 'black';

            }

            throw 'Application view must be block!'

        } catch(err){
            console.log(err)
            document.querySelector('#candidate-applications-view').style.display = 'block';
            appViewNav.style.color = 'red';
            loadApplications();
        }

    })


})

function loadApplications(){
    const start = counter;
    const end = start + quantity;
    counter = end;

    // const id = parseInt(document.querySelector('#candidate-id').innerHTML);

    fetch(`/home/candidate/${candidateId}/applications/search?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        data.applications.forEach(add_application);
    })
}

function add_application(app){
    const appList = document.querySelector('#application-list');

    const appDiv = document.createElement('a');
    appDiv.className = 'list-group-item list-group-item-action flex-column align-items-start';
    appDiv.id = app.id;
    appDiv.innerHTML = `
    <div class="d-flex w-100 justify-content-between">
        <h4 class="mb-1">${app.job}&nbsp;</h4>
        <small>Job Ref: ${app.job_id}</small>
    </div>
    <h5>${app.employer}</h5>
    <div class="d-flex w-100 mb-1 my-4 justify-content-between" id="application-submission-details">
    <p><b>Submitted:</b> ${app.submitted}</p>
    <p id="vacancy-closed-date"><b>Closing: </b>${app.job_closing}</p>
    </div>
    <small id="vacancy-closed"><i>Vacancy closed to applications</i></small>
    `
    appDiv.addEventListener('click', () => {
        try {
            const views = document.querySelectorAll('.views');

            for (const view of views){
                view.style.display = 'none'
            }

            throw `${app.id},${app.job_id}`

        } catch(err){
            console.log("The job clicked is: " + err.split(',')[1])
            // document.querySelector('#candidate-application-detail-view').style.display = 'block';
            const appId = err.split(',')[0]
            const jobId = err.split(',')[1]
            loadAppSummary(appId, jobId);
        }
    })
    checkApplicationStatus(app.id, appDiv);
    appList.appendChild(appDiv);
}

// function checkActiveVacancy(app, appDiv){

//     if(app.active_job == true){
//        const vacancyClosedTag = appDiv.querySelector('#vacancy-closed');
       
//        vacancyClosedTag.remove()
//     }
// }

function checkApplicationStatus(applicationId, appDiv){

    // const appDiv = document.querySelector(`a[id="${applicationId}"]`);
    const appDetails = appDiv.querySelector('#application-submission-details');

    fetch(`/application/${applicationId}`)
    .then(response => response.json())
    .then(data => data.forEach(function(application){
        console.log(application.stage)
        const jobClosing = new Date(application.job_closing);
        const today = new Date(new Date().toDateString());
        if(jobClosing >= today){
            console.log("job active");
            const vacancyClosedTag = appDiv.querySelector('#vacancy-closed');
            vacancyClosedTag.remove();
        } else if(jobClosing < today && application.stage === 1) { 
            console.log(`Application for ${application.job} has not yet undergone shortlisting`);
            appDiv.querySelector('#vacancy-closed-date').remove();

            // appDetails.lastElementChild.remove();

        } else if(jobClosing < today && application.stage === 2) {
            console.log(`Application for ${application.job} has been shortlisted`);

            appDetails.lastElementChild.remove();

            fetch(`/application/${applicationId}/interview_slot`)
            .then(response => response.json())
            .then(data => data.forEach(function(application){
                const interviewAlert = document.createElement('div');
                interviewAlert.className = "alert alert-info";
                interviewAlert.setAttribute("data-application", `${applicationId}`);
                interviewAlert.setAttribute("role", "alert");
                interviewAlert.innerHTML = `<i class="fas fa-info-circle"></i> You have been invited to an interview on <b>${application.interview_date}</b> at <b>${application.interview_time}</b>`;
                

                appDiv.insertBefore(interviewAlert, appDetails);

                let interview = new Date(application.interview_date)
                let today = new Date()
                today.setHours(0,0,0,0)
                console.log(today)
                console.log(interview)
                console.log(interview > today)
                if(interview < today) {
                    const interviewAlert = document.querySelector(`div[data-application="${applicationId}"]`);
                    interviewAlert.remove();
                    console.log(`Interview alert for application no.${applicationId} has been removed`);
                }
                console.log(new Date(application.interview_date));
            }))
        } else if(jobClosing < today && application.stage === 3){
            console.log(`Application for ${application.job} has been rejected pre-interview.`)
            appDiv.querySelector('#vacancy-closed-date').remove();

            const infoBadge = document.createElement('span');
            infoBadge.className = 'badge badge-danger';
            infoBadge.innerHTML = 'Unsuccessful';

            const jobTitle = appDiv.querySelector('h4');
            jobTitle.appendChild(infoBadge);
            
        } else if(jobClosing < today && application.stage === 4){
            console.log(`Application for ${application.job} has been rejected post-interview.`)

            const infoBadge = document.createElement('span');
            infoBadge.className = 'badge badge-danger';
            infoBadge.innerHTML = 'Unsuccessful';

            const jobTitle = appDiv.querySelector('h4');
            jobTitle.appendChild(infoBadge);

        } else{
            console.log(`Application for ${application.job} has been successful.`)

            appDiv.querySelector('#vacancy-closed-date').remove();
            
            const infoBadge = document.createElement('span');
            infoBadge.className = 'badge badge-success';
            infoBadge.innerHTML = 'Successful';

            const jobTitle = appDiv.querySelector('h4');
            jobTitle.appendChild(infoBadge);
        }
        
    }))
}

function loadAppSummary(appId, jobId){
    
    fetch(`/vacancy/${jobId}`)
    .then(response => response.json())
    .then(vacancy => {
        const jobId = document.querySelector('#job-id');
        const jobTitle = document.querySelectorAll('.job-title');
        const jobSalary = document.querySelector('#job-salary');
        const jobMD = document.querySelector('#job-md');
        const jobPS = document.querySelector('#job-ps');
        const jobContact = document.querySelector('#job-further-info');
        const companyInitial = document.querySelector('#company-initial');
        const company = document.querySelector('#company-name');
        vacancy.forEach(function(vacancy){
            jobId.innerHTML = `Job Ref: ${vacancy.id}`;
            for(const title of jobTitle){
                title.innerHTML = vacancy.job_title;
            }
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
            company.innerHTML = vacancy.company;
            companyInitial.innerHTML = vacancy.company.slice(0,1);

        })

    })
    fetch(`/application/${appId}`)
    .then(response => response.json())
    .then(application => {
        const appInfoCard = document.querySelector('#app-status-card');
        const appStatus = document.querySelector('#status-info');
        const submittedStatus = document.querySelector('#submit-date');
        application.forEach(function(application){
            console.log(application.job);
            appInfoCard.innerHTML = `Application Id: ${application.id}`;
            submittedStatus.innerHTML = application.submitted;

            const appStage = application.stage;
            const appSumm = document.querySelector('#app-summary');
            const checkEmail = document.createElement('div');
            checkEmail.className = "alert alert-info";
            checkEmail.setAttribute("role", "alert");

            switch (appStage) {
                case 2:
                    appStatus.innerHTML = `Shortlisted`;
                    console.log(`Application stage ${application.stage}`);
                    break;
                case 3:
                    appStatus.innerHTML = `Unsuccessful post-shortlisting`;
                    checkEmail.innerHTML = `<i class="fas fa-info-circle"></i> Unfortunately, your application has been unsuccessful. Please check your email for further information.`
                    appSumm.parentNode.insertBefore(checkEmail, appSumm.nextSibling);
                    console.log(`Application stage ${application.stage}`);
                    break;
                case 4:
                    appStatus.innerHTML = `Unsuccessful post-interview`;
                    checkEmail.innerHTML = `<i class="fas fa-info-circle"></i> Unfortunately, your inteverview has been unsuccessful. Please check your email for further information.`
                    appSumm.parentNode.insertBefore(checkEmail, appSumm.nextSibling);
                    console.log(`Application stage ${application.stage}`);
                    break;
                case 5:
                    appStatus.innerHTML = `Successfully recruited`;
                    checkEmail.innerHTML = `<i class="fas fa-info-circle"></i> Congratulations, your interview was successful. Please check your email for further information.`
                    appSumm.parentNode.insertBefore(checkEmail, appSumm.nextSibling);
                    console.log(`Application stage ${application.stage}`);
                    break;
                default:
                    console.log(`Application stage ${application.stage}`);
            }
            
            
        })
        
    })
    const candidate = document.querySelector('#candidate-id').innerHTML;
    const viewAppBtn = document.querySelector('#view-app-btn');
    viewAppBtn.addEventListener('click', () => {
        window.open(`/home/candidate/${candidate}/submitted_application/${jobId}/view_application`, "_blank")
    })

    document.querySelector('#candidate-application-detail-view').style.display = 'block';
    
}

