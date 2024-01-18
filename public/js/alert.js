//type is 'success' or 'error'

export const hideAlert = () => {
    const element = document.querySelector('.alert');
    if(element) element.parentElement.removeChild(element);
}
export const showAlert = (type, msg) => {
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup) //which means inside of the body but right at the begining and the mark up 
    window.setTimeout(hideAlert, 5000)
}

