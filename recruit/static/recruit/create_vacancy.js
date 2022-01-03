document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('#create-vacancy-navtab').style.color = 'red';

    document.querySelector('#create-new-vacancy-form').addEventListener('submit', (e) => {
        e.preventDefault()
        // const max_applications = document.querySelector('#id_max_applications');
        const deadline = document.querySelector('#id_deadline');
        const todayDate = new Date();
        const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const deadlineWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const formGroup = document.querySelector('.form-group');
        const existingMessage = document.querySelector('.error-message');
        const message = document.createElement('p');
        message.className = 'error-message';
        message.style.color = 'red';
        if (deadline.value == ''){
            console.log('cannot submit form because deadline missing');
            if (!formGroup.querySelector('.error-message')){
                message.innerText = 'Vacancy must have a deadline specified.';
                formGroup.insertBefore(message, document.querySelector('#vacancy-submit'))
                console.log('checkpoint 1')
                return;
            } else {
                existingMessage.innerText = 'Vacancy must have a deadline specified.';
                console.log('checkpoint 2')
                return;
            }
        } else if(deadline.value.length > 0 && deadline.valueAsDate < deadlineWeek){
            console.log('deadline is less than a week from now')
            if (!formGroup.querySelector('.error-message')){
                message.innerText = 'Deadline must be at least a week from today.';
                formGroup.insertBefore(message, document.querySelector('#vacancy-submit'))
                deadline.value = '';
                console.log('checkpoint 3')
                return;
            } else {
                existingMessage.innerText = 'Deadline must be at least a week from today.';
                deadline.value = '';
                console.log('checkpoint 4')
                return;
            }
        } else {
            console.log('checkpoint 5')
            document.forms['create-new-vacancy-form'].submit();

        }
    })

    document.querySelector('#interviews-navtab').addEventListener('click', () => {
        console.log("interview navtab has been clicked");
        const employerId = document.querySelector('#employer-id').innerHTML;
        window.location.href = `/home/employer/${employerId}/all_interviews`;
    })
})