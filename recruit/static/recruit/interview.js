const vacancyId = document.querySelector('#vacancy-id').innerHTML;
const vacancyTitle = document.querySelector('#vacancy-job-title').innerHTML;
const employerId = document.querySelector('#employer-id').innerHTML;
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

document.addEventListener('DOMContentLoaded', () => {
    const createIntView = document.querySelector('#create-interview-view');
    const viewIntView = document.querySelector('#view-interview-view');
    const postIntView = document.querySelector('#post-interview-view');

    document.querySelector('#interviews-navtab').addEventListener('click', () => {
        window.location.href = `/home/employer/${employerId}/all_interviews`;
    })

    try{
        document.querySelector('#decision-btn').addEventListener('click', (e) => {
            console.log("Submit decision button clicked.")
            submitDecision();
            
        })
    } catch(err){
        console.log("There is no submit decision button")
    }


    if (document.contains(createIntView)){
        console.log("create interview view showing");
        createInterview_View();
    } else if(document.contains(viewIntView)){
        console.log("view interview view showing");
        viewInterview_View();
    } else if(document.contains(postIntView)){
        console.log("post interview view showing")
        const vacancyStage = parseInt(document.querySelector('#vacancy-stage').innerHTML);

        if(vacancyStage === 4){
            console.log("run postInterview_View");
            postInterview_View();
        } else{
            console.log("run postHolder_View");
            postHolder_View();
        }
    } else {
        console.log("all interviews view showing");
        allInterviews_View();
    }
})

function createInterview_View(){

    const form = document.querySelector('#create-interview-form');
    const shortlistedApplicants = parseInt(document.querySelector('#no-shortlisted-applicants').innerHTML);

    try {
        const tabs = document.querySelectorAll('.navbar-tabs');

        for (const tab of tabs){
            tab.style.color = 'black';
        }

        throw `Must highlight create interview tab`

    } catch(err){
        console.log(err);
        const navList = document.querySelector('.flex-column');
        const logOut = document.querySelector('#log-out');
        const createIntTab = document.createElement('a');
        createIntTab.innerHTML = `Create Interview - Job Ref: ${vacancyId}`;
        createIntTab.className = 'btn btn-sm btn-outline-light navbar-tabs';
        createIntTab.style.color = 'red';
        navList.insertBefore(createIntTab, logOut);
    }

    if(shortlistedApplicants === 0){
        const fieldset = document.createElement('fieldset');
        fieldset.disabled = true;

        const formChildren = form.children;
        const formChildrenArray = Array.from(formChildren);

        formChildrenArray.forEach((child) => {
            fieldset.append(child);
        })

        form.appendChild(fieldset);
    } else{

        document.querySelector('#create-interview-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const todayDate = new Date();
            const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
            const weekFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            

            const input_date = document.querySelector('#id_starting_datetime').value.split('T')[0];
            const interview_date = new Date(input_date);

            const formGroup = document.querySelector('.form-group');
            // const existingMessage = document.querySelector('.error-message');
            const message = document.createElement('p');
            message.className = 'error-message';
            message.style.color = 'red';

            if (interview_date < weekFromToday){
                console.log("Date is less than a week from now!");
                console.log(`week from today: ${weekFromToday}`);
                if (!formGroup.querySelector('.error-message')){
                    message.innerText = 'Date must be at least a week from today.';
                    formGroup.insertBefore(message, document.querySelector('#interview-submit'))
                    console.log('checkpoint 1');
                    return;
                } else {
                    // existingMessage.innerText = 'Vacancy must have a deadline specified.';
                    console.log('checkpoint 2');
                    return;
                }
            } else {
                console.log('checkpoint 3');
                document.forms['create-interview-form'].submit();
            }
        })

    }
}


function viewInterview_View(){

    const cardHeader = document.querySelector('#view-interview-header');
    const cardTitle = document.querySelector('#view-interview-title');


    try {
        const tabs = document.querySelectorAll('.navbar-tabs');

        for (const tab of tabs){
            tab.style.color = 'black';
        }

        throw `Must highlight view interview tab`

    } catch(err){
        console.log(err);
        const viewIntTab = document.querySelector('#interviews-navtab');
        viewIntTab.innerHTML = `Interviews:<br>${vacancyTitle} (Ref: ${vacancyId})`
        viewIntTab.style.color = 'red';

    }

    fetch(`/vacancy/${vacancyId}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(function(vacancy){
            cardHeader.innerHTML = `Interview for ${vacancy.job_title} (Ref: ${vacancyId})`;
            cardTitle.innerHTML = vacancy.interview_date;

            if (vacancy.stage === 4){
                let intCard = document.querySelector('#interview-list');
                let info = document.createElement('div');
                info.className = "alert alert-info";
                info.innerHTML = `<i class="fas fa-info-circle"></i><b> Please note:</b> This interview has passed.`;
                intCard.appendChild(info);
            }
        })
    })

    fetch(`/vacancy/${vacancyId}/interview`)
    .then(response => response.json())
    .then(data => {
        data.forEach(function(interview){
            console.log(interview.interview_candidates)
            // for (const candidate of interview.interview_candidates){
                
                fetch(`/vacancy/${vacancyId}/shortlisted_applications`)
                .then(response => response.json())
                .then(data => {
                    const interviewList = document.querySelector('#interview-list');
                    data.applications.forEach(function(application){
                        const appCard = document.createElement('a');
                        appCard.className = 'list-group-item list-group-item-action flex-column align-items-start';
                        appCard.innerHTML = `
                        <div class="row">
                        <div class="col-2 d-flex align-items-center border-right">
                        <h4>${application.interview}</h4>
                        </div>
                        <div class="col-10">
                        <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${application.candidate}</h5>
                        <a href="${application.cv}" class="btn btn-secondary btn-sm" role="button" target="_blank">View CV</a>
                        </div>
                        <a class="text-decoration-none" data-toggle="collapse" href="#coverLetter${application.id}" aria-expanded="false" aria-controls="coverLetter${application.id}">Cover Letter</a>
                        <div class="collapse multi-collapse" id="coverLetter${application.id}">
                            <div class="card card-body">
                                <pre>${application.cover_letter}</pre>
                            </div>
                        </div>
                        </div>
                        </div>
                        `

                        interviewList.appendChild(appCard);
                    })
                })
            // }
        })
    })
}


function allInterviews_View(){

    try {
        
        const tabs = document.querySelectorAll('.navbar-tabs');

        for (const tab of tabs){
            tab.style.color = 'black';
        }

        throw 'Must highlight interview tab'

    } catch(err){

        console.log(err);
        document.querySelector('#interviews-navtab').style.color = 'red';

        if (parseInt(document.querySelector('#employer-upcoming-interviews').innerHTML) === 0){

            const intCard = document.createElement('a');
            intCard.className = 'list-group-item list-group-item-action flex-column align-items-center my-5';
            intCard.innerHTML = '<h6 class="text-center">No upcoming interviews to show here.</h6>';

            document.querySelector('#upcoming-interviews-card').appendChild(intCard);
            
        } else {

            fetch(`/home/employer/${employerId}/interviews`)
            .then(response => response.json())
            .then(data => data.forEach(function(interview){
                console.log(interview.interview_candidates.length);
                const intCard = document.createElement('a');
                intCard.className = 'list-group-item list-group-item-action flex-column align-items-start';
                intCard.innerHTML = `
                <div class="d-flex w-100 justify-content-between" style="pointer-events:none;">
                <h5 class="mb-1" style="pointer-events:auto;"><strong>${interview.job}</strong></h5>
                <small>No. of Interviewees <span class="badge badge-secondary badge-pill">${interview.interview_candidates.length}</span></small>
                </div>
                <h6>Date: ${interview.date}</h6>
                <h6>Start: ${interview.time}</h6>
                `

                const intList = document.querySelector('#upcoming-interviews-card');
                intList.appendChild(intCard);


            }))
        
        }

        if (parseInt(document.querySelector('#employer-interviews-to-create').innerHTML) === 0) {

            document.querySelector('.interviews-to-create-card').remove()
        } else {
            // put fetch function here

            fetch(`/home/employer/${employerId}/interviews_to_create`)
            .then(response => response.json())
            .then(data => data.forEach(function(job){
                console.log("This is a checkpoint")

                const jobCard = document.createElement('a');
                jobCard.className = 'list-group-item list-group-item-action flex-column align-items-start job-card'
                jobCard.dataset.vacancyId = `${job.id}`
                // SALARY FORMATTING
                const figure = `${job.salary}`.toString()
                const a = figure.slice(0,2)
                const b = figure.slice(2,6)
                const salary = `£${a},${b}`

                jobCard.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1" style="pointer-events:auto;"><strong>${job.job_title}</strong></h5>
                <small>Applications Received <span class="badge badge-secondary badge-pill">${job.applications}</span></small>
                </div>
                <p class="mb-1">
                    ${salary}<br>
                    ${job.category}<br>
                    ${job.city}
                </p>
                <p class="mb-3"><small><i>Closed: ${job.deadline}</i></small></p>
                <div class="d-flex w-100 justify-content-between">
                </div>
                `


                // ADD EVENT LISTENER TO JOB CARD

                jobCard.addEventListener('click', () => {
                    console.log(`Job ${job.id} has been clicked`);
                    window.location.href = `/home/employer/${employerId}/vacancy/${job.id}/create_interview`
                })

                const createIntCard = document.querySelector('#interviews-to-create-card');
                createIntCard.appendChild(jobCard);
            }))

        }
        // document.querySelector('#all-interviews-view').style.display = 'block';

    }
}


function postInterview_View(){

    try {
        
        const tabs = document.querySelectorAll('.navbar-tabs');

        for (const tab of tabs){
            tab.style.color = 'black';
        }

        throw 'Must highlight interview tab'

    } catch(err){

        console.log(err);
        document.querySelector('#interviews-navtab').style.color = 'red';
        document.querySelector('#interviews-navtab').innerHTML = `Post-Interview - (Job Ref: ${vacancyId})`;

    }

    fetch(`/vacancy/${vacancyId}/interview`)
    .then(response => response.json())
    .then(data => data.forEach(function(interview){
        const postIntCard = document.querySelector('#post-interview-card');
        const submitBtn = document.querySelector('#decision-btn');
        const info = document.createElement('div');
        info.className = "alert alert-info";
        info.innerHTML = `<i class="fas fa-info-circle"></i><b> Please note:</b> Interviews for this vacancy were held on ${interview.date}. Please select one successful candidate below.`;
        postIntCard.insertBefore(info, submitBtn);
        interview.interview_candidates.forEach(function(interviewee){
            console.log(`Interviewee appNo: ${interviewee}`)
            displayInterviewee(interviewee)
        })
    }))

}



function postHolder_View(){

    // fetch(`/vacancy/${vacancyId}/interview`)
    // .then(response => response.json())
    // .then(data => data.forEach(function(postholder){

    // }))

    const navTab = document.createElement('a');
    navTab.className = "btn btn-sm btn-outline-light navbar-tabs";
    navTab.id = "interview-outcome-navtab";
    navTab.style.color = 'red';
    navTab.innerText = `Vacancy Filled - (Job Ref: ${vacancyId})`;
    document.querySelector('.flex-column').insertBefore(navTab, document.getElementById('log-out'));
    $.ajax({
        type: 'GET',
        url: `/vacancy/${vacancyId}/postholder`,
        success: function(json){
            const postholderName = json["postholderName"];
            const postholderEmail = json["postholderEmail"];
            const appDiv = document.createElement('a');
            appDiv.className = 'list-group-item list-group-item-action flex-column align-items-start';
            appDiv.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${postholderName}</h5>
            <h6 class="mb-1">${postholderEmail}</h6>
            </div>
        
        `
            document.querySelector('#interview-outcome-card').insertBefore(appDiv, document.querySelector('#postholder-info'));
        }
    })

}


function displayInterviewee(applicationId){

    fetch(`/application/${applicationId}`)
    .then(response => response.json())
    .then(data => data.forEach(function(application){
        const appDiv = document.createElement('a');
        appDiv.className = 'list-group-item list-group-item-action flex-column align-items-start';
        appDiv.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${application.candidate}</h5><br>
            <div class="form-check form-check-inline float-right">
                <input type="radio" class="form-check-input" id="postholder" name="candidateSelection" value="${application.id}">
                <label for="postholder" class="form-check-label mr-3">Successful</label>
            </div>
        </div>
        <p>[Application No: ${application.id}]</p>
        
        
        `
        document.querySelector('#post-interview-card').insertBefore(appDiv, document.querySelector('#decision-btn'));
    }))
}


function submitDecision(){

    const checkedFields = document.querySelectorAll('input[type="radio"]:checked');
    const allCandidates = document.querySelectorAll('input[type="radio"]');

    if(checkedFields.length === 0){
        const submitDecisionBtn = document.querySelector('#decision-btn');
        submitDecisionBtn.classList.remove("my-3");
        if(document.getElementById('warning')){
            console.log("There is already a warning alert so do nothing!");
        } else{
            const warning = document.createElement('p')
            warning.innerHTML = 'You must select a successful candidate before submitting.'
            warning.id = "warning";
            warning.className = 'mt-3';
            warning.style.color = 'red';
            document.querySelector('#post-interview-card').insertBefore(warning, document.querySelector('#decision-btn'));
        }
        return;
    } else{
        const successfulApplicant = document.querySelector('input[type="radio"]:checked').value;
        selectPostholder(successfulApplicant, 5);
        for (const candidate of allCandidates){
            if(candidate.checked === false){
                // console.log(`Application ${candidate.value} has been rejected`);
                selectPostholder(candidate.value, 4);
            }
        }
    }

    window.location.href = `/home/employer/${employerId}/vacancy/${vacancyId}/post_interview`;
}


function selectPostholder(applicationId, decision){
    $.ajax({
        type: 'POST',
        url: `/application/${applicationId}/shortlisting_decision`,
        data: {
            decision: decision,
            csrfmiddlewaretoken: csrftoken,
        },
        success: function(json) {
            if(json["stage"] === 'REJECTED POST-INTERVIEW'){
                console.log(`Application ${applicationId} has been unsuccessful.`);
            } else if(json["stage"] === 'SUCCESSFUL'){
                console.log(`Application ${applicationId} has been successful.`);
            }
        }
    })
}
